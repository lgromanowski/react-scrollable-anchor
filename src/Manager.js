import jump from 'jump.js'
import { debounce } from './utils/func'
import { getBestAnchorGivenScrollLocation, getScrollTop } from './utils/scroll'
import { getHash, updateHash, removeHash } from './utils/hash'

const defaultConfig = {
  offset: 0,
  scrollDuration: 400,
  keepLastAnchorHash: false,
}

class Manager {
  constructor() {
    this.anchors = {}
    this.forcedHash = false
    this.forcedScroll = false;
    this.config = defaultConfig
    this.hashChangeListeners = []

    this.scrollHandler = debounce(this.handleScroll, 100)
    this.forceHashUpdate = debounce(this.handleHashChange, 1)
    this.triggerHashChangeEvent = (hash, affectHistory) => {
      this.hashChangeListeners.forEach(fn => fn(hash, affectHistory))
    }
  }

  onHashChange = (fn) => {
    this.hashChangeListeners.push(fn);

    return () => {
      this.hashChangeListeners.splice(this.hashChangeListeners.indexOf(fn), 1);
    }
  }

  addListeners = () => {
    window.addEventListener('scroll', this.scrollHandler, false)
    window.addEventListener('hashchange', this.handleHashChange)
  }

  removeListeners = () => {
    window.removeEventListener('scroll', this.scrollHandler, false)
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  configure = (config) => {
    this.config = {
      ...defaultConfig,
      ...config,
    }
  }

  goToTop = () => {
    if (getScrollTop() === 0) return
    this.forcedHash = true
    window.scroll(0,0)
  }

  addAnchor = (id, component) => {
    // if this is the first anchor, set up listeners
    if (Object.keys(this.anchors).length === 0) {
      this.addListeners()
    }
    this.forceHashUpdate()
    this.anchors[id] = component
  }

  removeAnchor = (id) => {
    delete this.anchors[id]
    // if this is the last anchor, remove listeners
    if (Object.keys(this.anchors).length === 0) {
      this.removeListeners()
    }
  }

  handleScroll = () => {
    const {offset, keepLastAnchorHash} = this.config
    const bestAnchorId = getBestAnchorGivenScrollLocation(this.anchors, offset)

    if (this.forcedScroll) {
      this.forcedScroll = false;
    } else if (bestAnchorId && getHash() !== bestAnchorId) {
      this.forcedHash = true
      updateHash(bestAnchorId, false)
      this.triggerHashChangeEvent(bestAnchorId, false)
    } else if (!bestAnchorId && !keepLastAnchorHash) {
      removeHash()
      this.triggerHashChangeEvent('', false)
    }
  }

  handleHashChange = (e) => {
    if (this.forcedHash) {
      this.forcedHash = false
    } else {
      this.goToSection(getHash())
    }
  }

  goToSection = (id) => {
    let element = this.anchors[id]
    if (element) {
      this.forcedScroll = true;
      jump(element, {
        duration: this.config.scrollDuration,
        offset: this.config.offset,
      })
    } else {
      // make sure that standard hash anchors don't break.
      // simply jump to them.
      element = document.getElementById(id)
      if (element) {
        jump(element, {
          duration: 0,
          offset: this.config.offset,
        })
      }
    }
  }
}

export default new Manager()
