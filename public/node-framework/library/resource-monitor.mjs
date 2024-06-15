/**
 * Created on 02/09/23
 *
 * @file
 * This library is responsible for monitoring application resources such as memory consumption,
 * event listeners created, among others. It provides functionality to regularly dump memory statistics
 * and analyze heap differences to assist in identifying potential memory leaks or areas of heavy resource usage.
 *
 * @author André Timermann <andre@timermann.com.br>
 */
import memwatch from '@airbnb/node-memwatch'
import v8 from 'node:v8'
import { filesize } from 'filesize'

import createLogger from './logger.mjs'
import Config from './config.mjs'

let logger

/**
 * ResourceMonitor is a utility class for monitoring and logging various resource usage metrics
 * within an application, such as memory consumption. It can be configured to periodically dump memory usage stats
 * and identify changes in heap allocation to help in spotting memory leaks.
 */
export default class ResourceMonitor {
  /**
   * Indicates whether the resource monitoring is enabled.
   *
   * @type {boolean}
   */
  static enabled
  /**
   * HeapDiff instance used for calculating differences in memory heap across dumps.
   *
   * @type {memwatch.HeapDiff}
   */
  static hd
  /**
   * Size limit for detailing individual heap allocations in memory dumps.
   *
   * @type {number}
   */
  static detailSizeLimit
  /**
   * Node limit for detailing changes in heap allocations in memory dumps.
   *
   * @type {number}
   */
  static detailNodesLimit

  /**
   * Interval in minutes for performing memory dumps.
   *
   * @type {number}
   */
  static monitorInterval

  /**
   * Initialize the ResourceMonitor class
   * Fetches configurations and initializes the logger and static properties.
   *
   * @static
   */
  static init () {
    this.monitorInterval = Config.get('resourceMonitor.dumpMemory.dumpInterval', 'number')
    const enableMemoryDump = Config.get('resourceMonitor.dumpMemory.enabled', 'boolean')
    this.detailSizeLimit = Config.get('resourceMonitor.dumpMemory.detailSizeLimit', 'number')
    this.detailNodesLimit = Config.get('resourceMonitor.dumpMemory.detailNodesLimit', 'number')

    logger = createLogger('ResourceMonitor')
    logger.info('Initializing...')
    logger.info(`Monitor Interval (min): ${this.monitorInterval}`)
    logger.info(`Size limit:             ${filesize(this.detailSizeLimit)}`)
    logger.info(`Nodes limit):           ${this.detailNodesLimit}`)

    if (enableMemoryDump) this.#initMemoryDump()
  }

  /**
   * Initializes the memory dumping process. Sets an interval to periodically call the dumpMemory
   * method based on the configured monitor interval.
   *
   * @static
   */
  static #initMemoryDump () {
    logger.info('Dumping memory...')
    this.hd = new memwatch.HeapDiff()
    setInterval(() => {
      this.#dumpMemory()
    }, Math.ceil(this.monitorInterval) * 60000)
  }

  /**
   * Collects and returns heap statistics as an object containing detailed memory usage information.
   * Provides data on total memory allocated, memory in use, memory limit, and the percentage of memory used.
   *
   * @return {object | null} An object containing memory statistics, or null if monitoring is not enabled.
   */
  static getMemoryInfo () {
    if (this.enabled === undefined) this.enabled = Config.get('resourceMonitor.enabled', 'boolean')

    if (this.enabled) {
      const heapData = v8.getHeapStatistics()
      return {
        memoryAllocated: filesize(heapData.total_heap_size),
        memoryUsed: filesize(heapData.used_heap_size),
        memoryLimit: filesize(heapData.heap_size_limit),
        memoryUsedPercent: `${((heapData.total_heap_size / heapData.heap_size_limit) * 100).toFixed(1)}%`
      }
    }

    return null
  }

  /**
   * Perform memory dumping
   * Analyzes heap differences since the last dump and logs the changes.
   */
  static #dumpMemory () {
    logger.info('Dumping memory...')
    const diff = this.hd.end()
    delete this.hd
    this.hd = new memwatch.HeapDiff()

    logger.info(`Total memory allocated: "${diff.change.size}" Freed Nnodes: "${diff.change.freed_nodes}" Allocated nodes: "${diff.change.allocated_nodes}"`)
    diff.change.details
      .filter(detail => {
        if (detail.size_bytes > this.detailSizeLimit) return true
        return detail['+'] - detail['-'] > this.detailNodesLimit
      })
      .sort((a, b) => {
        if (a.size_bytes > b.size_bytes) return -1
        if (a.size_bytes < b.size_bytes) return 1
        return 0
      })
      .forEach(detail => {
        logger.info(`${(detail.what + ':').padEnd(30)} Allocation: ${String(detail['+'] - detail['-']).padStart(6)}        Size: ${detail.size.padStart(12)}`)
      })
  }
}
