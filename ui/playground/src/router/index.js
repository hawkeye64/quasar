import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import routes from './routes'

export default function defineRouter(/* { store, ssrContext } */) {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: to =>
      to.meta && to.meta.skipScroll === true ? false : { x: 0, y: 0 },
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  return Router
}
