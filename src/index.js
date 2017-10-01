import Manager from './Manager'
export const goToTop = Manager.goToTop
export const configureAnchors = Manager.configure
export const onHashChange = Manager.onHashChange

export { updateHash as goToAnchor, removeHash } from './utils/hash'
export { default } from './ScrollableAnchor'
