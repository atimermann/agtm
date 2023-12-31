/**
 * **Created on 14/11/18**
 *
 * src/library/winstonTransport/winston-graylog.js
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Versão modificado do Transport https://github.com/Buzut/winston-log2gelf *
 *  Adiciona suporte a Cluster
 *
 * @todo Refazer usando biblioteca oficial: https://marketplace.graylog.org/addons/d1c625ef-3d51-4376-aecd-5c1fa1156aee
 */
'use strict'

const os = require('os')
const net = require('net')
const secNet = require('tls')
const http = require('http')
const https = require('https')
const Transport = require('winston-transport')

/**
 *
 */
class Log2gelf extends Transport {
  /**
   * Constructs an instance of the Log2gelf transport.
   *
   * @param {object} options  - Configuration options for the transport.
   */
  constructor (options) {
    super(options)

    this.name = options.name || 'log2gelf'
    this.hostname = options.hostname || os.hostname()
    this.host = options.host || '127.0.0.1'
    this.port = options.port || 12201
    this.protocol = options.protocol || 'tcp'
    this.reconnect = options.reconnect || '0'
    this.wait = options.wait || 1000
    this.exitOnError = options.exitOnError || false
    this.exitDelay = options.exitDelay || 2000
    this.service = options.service || 'nodejs'
    this.level = options.level || 'info'
    this.silent = options.silent || false
    this.environment = options.environment || 'development'
    this.release = options.release
    this.customPayload = {}

    Object.keys(options).forEach((key) => {
      if (key[0] === '_') this.customPayload[key] = options[key]
    })

    // set protocol to use
    if (this.protocol === 'tcp' || this.protocol === 'tls') {
      const tcpGelf = this.sendTCPGelf()
      this.send = tcpGelf.send
      this.end = tcpGelf.end
    } else if (this.protocol === 'http' || this.protocol === 'https') this.send = this.sendHTTPGelf(this.host, this.port, false)
    else throw new TypeError('protocol shoud be one of the following: tcp, tls, http or https')

    // @agt Define atributos do Cluster
    this.clusterNode = null
    this.clusterLeader = null
  }

  /**
   * Parse a Winston log level string and return its equivalent numeric value.
   * The log levels are mapped as follows: error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5.
   * Any unrecognized level defaults to 0.
   *
   * @param  {string} level  - The log level as a string.
   * @return {number}        The numeric value corresponding to the provided log level.
   */
  levelToInt(level) { // eslint-disable-line
    if (level === 'error') return 0
    if (level === 'warn') return 1
    if (level === 'info') return 2
    if (level === 'verbose') return 3
    if (level === 'debug') return 4
    if (level === 'silly') return 5

    return 0
  }

  /**
   * Open a TCP socket and return a logger funtion.
   *
   * @return { Function } logger – logger(JSONlogs)
   */
  sendTCPGelf () {
    const options = {
      host: this.host,
      port: this.port,
      rejectUnauthorized: false
    }

    // whether or not tls is required
    let clientType
    if (this.protocol === 'tls') clientType = secNet
    else clientType = net

    const client = clientType.connect(options)

    client.on('connect', () => {
      console.log('Connected to Graylog server')
      client.reconnect = 0
    })

    client.on('end', () => {
      console.log('Disconnected from Graylog server')
    })

    client.on('error', (err) => {
      console.error('Error connecting to Graylog:', err.message)
      client.reconnect = client.reconnect + 1 || 0
    })

    client.on('close', () => {
      if (!client.ended && (this.reconnect === -1 || client.reconnect < this.reconnect)) {
        client.timeout_id = setTimeout(() => {
          client.timeout_id = null
          client.connect(options)
        }, this.wait)
      }
    })

    return {
      send (msg) {
        client.write(`${msg}\0`)
      },
      end () {
        if (client.timeout_id) {
          clearTimeout(client.timeout_id)
        }
        client.ended = true
        client.end()
      }
    }
  }

  /**
   * Set HTTP(S) connection and return logger function.
   *
   * @return { Function } logger – logger(JSONlogs)
   */
  sendHTTPGelf () {
    const options = {
      port: this.port,
      hostname: this.host,
      path: '/gelf',
      method: 'POST',
      rejectUnauthorized: false
    }

    let clientType
    if (this.protocol === 'https') clientType = https
    else clientType = http

    return (msg) => {
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(msg)
      }

      const req = clientType.request(options, (res) => { // eslint-disable-line
        // usefull for debug
        // console.log('statusCode: ', res.statusCode);
      })

      req.on('error', (e) => {
        console.error('Error connecting to Graylog:', e.message)
      })

      req.write(msg)
      req.end()
    }
  }

  /**
   * Handles the log message, formats it, and sends it to the logging service.
   * If 'silent' mode is on, the callback is invoked immediately without logging.
   * Converts the message to a structured format and merges it with any custom payload before sending.
   *
   * @param {object}   info      - Log object containing message and metadata.
   * @param {Function} callback  - Callback function to execute after logging.
   */
  log (info, callback) {
    if (this.silent) {
      callback()
      return
    }

    const msg = (typeof info.message === 'string' || info.message instanceof String) ? info.message.split('\n')[0] : info.message

    const meta = {}
    Object.keys(info).forEach((key) => {
      if (key !== 'error' && key !== 'level') meta[key] = info[key]
    })

    const payload = {
      timestamp: Math.floor(Date.now() / 1000),
      level: this.levelToInt(info.level),
      host: this.hostname,
      short_message: msg,
      full_message: JSON.stringify(meta, null, 2),
      _service: this.service,
      _environment: this.environment,
      _release: this.release,
      // @agt
      _node: this.clusterNode,
      _leader: this.clusterLeader ? 1 : 0 // TODO: Não envia String
    }

    const gelfMsg = Object.assign({}, payload, this.customPayload)
    this.send(JSON.stringify(gelfMsg))

    // as we can't know when tcp is sent, delay cb for 2secs
    if (info.exception && this.exitOnError) {
      setTimeout(() => {
        this.end()
        process.exit(5)
      }, this.exitDelay)
    }

    callback()
  }

  /**
   * Updates the cluster node and leader information for the transport.
   *
   * @param {string}  node    - Identifier for the current cluster node.
   * @param {boolean} leader  - Indicates if the current node is the cluster leader.
   */
  updateClusterInfo (node, leader) {
    this.clusterNode = node
    this.clusterLeader = leader
  }
}

module.exports = Log2gelf
