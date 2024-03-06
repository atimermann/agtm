/**
 * @file  Imports the necessary modules and sets constant values for color codes.
 */

import blessed from 'blessed'
import { filesize } from 'filesize'
import { io } from 'socket.io-client'
import Config from './config.mjs'

const RESET_COLOR = '\x1b[0m'
const BLUE_DARK_COLOR = '\x1b[1;94m'
const YELLOW_COLOR = '\x1b[33m'
const PURLE_COLOR = '\x1b[35m'

/**
 * Specifies the maximum number of log messages to keep in history to prevent performance issues. Decrease this value if the interface becomes sluggish.
 *
 * @type {number}
 */

const LOG_HISTORY_SIZE = 20
/**
 * Defines the interval (in milliseconds) at which the log messages are refreshed on the screen. Increase this value if the interface becomes sluggish.
 *
 * @type {number}
 */
const LOG_UPDATE_INTERVAL = 1000

/**
 * Implements a terminal-based user interface using the 'blessed' library, for displaying log messages in a structured and interactive manner.
 *
 * @author André Timermann <andre@timermann.com.br>
 */
export default class BlessedInterface {
  /**
   * Maps box names to their instances for quick access.
   *
   * @type {{[key: string]: blessed.Widgets.BoxElement}}
   */
  static indexedBoxes = {}

  /**
   * Holds an array of all box instances for iteration purposes.
   *
   * @type {blessed.Widgets.BoxElement[]}
   */
  static boxes = []
  /**
   * References the currently active (focused) box, if any.
   *
   * @type {blessed.Widgets.BoxElement|null}
   */
  static activeBox = null
  /**
   * Indicates whether the UI has been fully initialized and is ready to display logs.
   *
   * @type {boolean}
   */
  static ready = false

  /**
   * Stores lines of log messages for each box. Indexed by box name.
   *
   * @type {{[key: string]: boolean}}
   */
  static boxesLines = {}

  /**
   * Tracks which boxes need to be updated due to new log messages.
   *
   * @type {{[key: string]: boolean}}
   */
  static boxesForUpdate = {}

  /**
   * Initializes the user interface, creating the main screen, setting up keyboard shortcuts, and establishing a socket connection for log messages.
   *
   * @static
   */
  static init () {
    this.screen = blessed.screen({
      smartCSR: true,
      log: 'log.txt',
      fullUnicode: true,
      dockBorders: true,
      ignoreDockContrast: true
    })

    this.screen.on('resize', () => {
      this.#resizeBoxes(null, -2)
    })

    this.#setShortcuts()

    this.#createStatusBar()
    this.screen.render()
    this.ready = true

    this.connectSocketServer()

    setInterval(() => this.#updateLogs(), LOG_UPDATE_INTERVAL)
  }

  /**
   * Establishes a connection to the specified log server using socket.io, handles connection events, and receives log messages.
   *
   * @static
   */
  static connectSocketServer () {
    const socketAddress = Config.get('monitor.socketServer')

    this.log(`Establishing connection to the log server: ${socketAddress}...`, 'Monitor')
    const socketLoggerClient = io(socketAddress)

    socketLoggerClient.on('connect', () => {
      this.log('Connected!', 'Monitor')
    })

    socketLoggerClient.on('disconnect', reason => {
      this.log('Disconnected from the log server.', 'Monitor')
      this.log(`Socket id: "${socketLoggerClient.id}"`, 'Monitor')
      this.log(`Reason: "${reason}"`, 'Monitor')
    })

    socketLoggerClient.on('connect_error', error => {
      this.log('Error connecting to the log server', 'Monitor')
      this.log(error.message, 'Monitor')
      this.log('Tip: Check if the socket server and the socket transport are active.', 'Monitor')
    })

    socketLoggerClient.on('log', logObj => {
      const { message, module } = this.#parselogObj(logObj)
      this.log(message, module)
    })
  }

  /**
   * Determines the appropriate color code for log messages based on their severity level.
   *
   * @param  {string} level  - The severity level of the log message ('info', 'warn', 'error', 'debug').
   * @return {string}        The escape code for the color associated with the given severity level.
   * @static
   */
  static #getLevelColor (level) {
    switch (level) {
      case 'info': // INFO
        return '\x1b[39m'
      case 'warn': // WARN
        return YELLOW_COLOR
      case 'error': // ERROR
        return '\x1b[31m'
      case 'debug': // ERROR
        return '\x1b[92m'
      default:
        return RESET_COLOR
    }
  }

  /**
   * Parses log objects received from the log server, formatting them for display in the UI.
   *
   * @param  {object} logObj  - The log object containing the level, module, and message.
   * @return {object}         An object containing the formatted message and the module name.
   * @static
   */
  static #parselogObj (logObj) {
    const { level, module, message } = logObj

    const date = new Date()
    const levelColor = this.#getLevelColor(level)
    const levelText = `${levelColor}${level.padEnd(5)}${RESET_COLOR}`
    const moduleText = module ? `${BLUE_DARK_COLOR}[${module}]${RESET_COLOR}` : ''
    const msgColor = `${levelColor}${message}${levelColor}`
    const formattedTime = `${PURLE_COLOR}${date.toLocaleString()}.${date.getMilliseconds()}${RESET_COLOR}`

    return {
      message: `${formattedTime} ${levelText} ${moduleText} ${msgColor}`,
      module
    }
  }

  /**
   * Appends a log message to the specified box, creating a new box if necessary.
   *
   * @param {string} message  - The log message to display.
   * @param {string} boxName  - The name of the box to which the message should be added.
   * @static
   */
  static log (message, boxName) {
    if (!this.ready) return

    if (!this.indexedBoxes[boxName]) {
      this.#createBox(boxName)
    }

    if (!this.boxesLines[boxName]) {
      this.boxesLines[boxName] = []
    }

    // indica q o box precisa ser atualizado
    this.boxesForUpdate[boxName] = true

    const box = this.indexedBoxes[boxName]
    const boxLines = this.boxesLines[boxName]
    if (box) {
      if (boxLines.length >= LOG_HISTORY_SIZE) {
        boxLines.shift()
      }
      boxLines.push(message)
    } else {
      console.error(`Box "${boxName}" not found!`)
    }
  }

  /**
   * Periodically updates the content of all boxes marked for update with the latest log messages.
   *
   * @static
   */
  static #updateLogs () {
    for (const boxName of Object.keys(this.indexedBoxes)) {
      if (this.boxesForUpdate[boxName]) {
        this.indexedBoxes[boxName].setContent(this.boxesLines[boxName].join('\n'))
        delete this.boxesForUpdate[boxName]
      }
    }
  }

  /**
   * Sets up keyboard shortcuts for application control, such as quitting, restarting, and navigating between boxes.
   *
   * @static
   */
  static #setShortcuts () {
    this.screen.key(['q', 'C-c'], () => process.exit(0)) // Close application
    this.screen.key(['r'], () => process.exit(12)) // Reboot application
    this.screen.key('C-right', () => this.#moveBoxFocusTo('right'))
    this.screen.key('C-left', () => this.#moveBoxFocusTo('left'))
    this.screen.key('C-down', () => this.#moveBoxFocusTo('down'))
    this.screen.key('C-up', () => this.#moveBoxFocusTo('up'))
  }

  /**
   * Creates a status bar at the bottom of the screen, displaying helpful shortcuts and real-time memory usage information.
   *
   * @param {string} [boxName]  - The name of the box for which the status bar is being created. Currently not used.
   * @static
   */
  static #createStatusBar (boxName) {
    this.statusBar = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: 'This box has no border',
      border: {
        type: 'line',
        style: {
          border: 'white'
        }
      }
    })
    this.screen.append(this.statusBar)

    const helpText = '(q) quit, (r) restart, (ctrl+[up|down|left|right] switch box, (up|down) scroll text'
    const help = blessed.text({
      height: 1,
      width: helpText.length,
      content: helpText
    })

    this.applicationInfo = blessed.text({
      height: 1,
      right: 1

    })

    this.statusBar.append(help)
    this.statusBar.append(this.applicationInfo)

    setInterval(() => {
      this.applicationInfo.setContent(`Memory: ${filesize(process.memoryUsage().rss)}`)
    }, 1000)
  }

  /**
   * Creates a new box on the screen for displaying log messages.
   *
   * @param {string} boxName  - The name of the box to create.
   * @static
   */
  static #createBox (boxName) {
    const newBox = blessed.log({
      mouse: false,
      keys: true,
      scrollbar: {
        ch: ' ',
        inverse: true
      },
      top: '0',
      left: '0',
      width: '50%',
      height: '50%',
      label: boxName,
      border: {
        type: 'line',
        style: {
          border: 'white'
        }
      },
      scrollable: true
    })

    newBox.on('focus', () => {
      newBox.style.border.fg = 'cyan'
      newBox.setScrollPerc(100)
      this.screen.render()
    })

    newBox.on('blur', () => {
      newBox.style.border.fg = 'white'
      newBox.setScrollPerc(100)
      this.screen.render()
    })

    this.boxes.push(newBox)
    this.indexedBoxes[boxName] = newBox
    this.screen.append(newBox)
    this.#resizeBoxes(null, -2)

    this.screen.render()
  }

  /**
   * Dynamically resizes all boxes based on the current screen size and optional custom dimensions.
   *
   * @param {number|null} customWidth     - Optional custom width for the boxes.
   * @param {number|null} customHeight    - Optional custom height for the boxes.
   * @param {number}      [offsetWidth]   - Horizontal space to leave empty on the sides of the boxes.
   * @param {number}      [offsetHeight]  - Vertical space to leave empty above and below the boxes.
   */
  static #resizeBoxes (customWidth, customHeight, offsetWidth = 0, offsetHeight = 0) {
    const boxCount = this.boxes.length
    const cols = Math.ceil(Math.sqrt(boxCount))
    const rows = Math.ceil(boxCount / cols)

    const screenWidth = customWidth < 0
      ? this.screen.width + customWidth - offsetWidth // Subtract offsetWidth if customWidth is negative
      : customWidth || this.screen.width - offsetWidth // Subtract offsetWidth

    const screenHeight = customHeight < 0
      ? this.screen.height + customHeight - offsetHeight // Subtract offsetHeight if customHeight is negative
      : customHeight || this.screen.height - offsetHeight // Subtract offsetHeight

    this.boxes.forEach((box, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      box.top = Math.floor((row * screenHeight) / rows) + offsetHeight // Add offsetHeight to the box's top position
      box.left = Math.floor((col * screenWidth) / cols) + offsetWidth // Add offsetWidth to the box's left position
      box.width = Math.floor(screenWidth / cols)
      box.height = Math.floor(screenHeight / rows)
    })
  }

  /**
   * Moves focus to a specific direction. If there are no boxes in the direction, nothing happens.
   *
   * @param {string} direction  - The direction to move the focus to. Can be 'up', 'down', 'left', 'right'.
   */
  static #moveBoxFocusTo (direction) {
    if (!this.activeBox && this.boxes.length > 0) {
      this.activeBox = this.boxes[0]
      this.activeBox.focus()
      return
    }

    // Get the list of boxes that are on the same row as the active box.
    let sameAxieBoxes = this.boxes.filter(box => {
      return ['left', 'right'].includes(direction)
        ? box.top === this.activeBox.top
        : box.left === this.activeBox.left
    })

    // Get Boxes from target direction
    sameAxieBoxes = sameAxieBoxes.filter(box => {
      switch (direction) {
        case 'right':
          return box.left > this.activeBox.left
        case 'left':
          return box.left < this.activeBox.left
        case 'up':
          return box.top < this.activeBox.top
        case 'down':
          return box.top > this.activeBox.top
        default:
          throw new Error('invalid Direction')
      }
    })

    // If there are no boxes to the right, do nothing.
    if (sameAxieBoxes.length === 0) return

    // Find the box that is closest to the right of the active box.
    // Set the next box as the active box.
    this.activeBox = sameAxieBoxes.reduce((closestBox, box) => {
      switch (direction) {
        case 'right':
          return (box.left < closestBox.left) ? box : closestBox
        case 'left':
          return (box.left > closestBox.left) ? box : closestBox
        case 'up':
          return (box.top > closestBox.top) ? box : closestBox
        case 'down':
          return (box.top < closestBox.top) ? box : closestBox
        default:
          throw new Error('invalid Direction')
      }
    })

    this.activeBox.focus()
  }
}
