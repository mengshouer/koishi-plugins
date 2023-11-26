import { Context } from '@koishijs/client'
import Sandbox from './layout.vue'
import './icons'

export default (ctx: Context) => {
  ctx.page({
    name: '第三方沙盒',
    path: '/unofficial/sandbox',
    icon: 'activity:flask',
    order: 300,
    authority: 4,
    component: Sandbox,
  })

  ctx.menu('uSandbox.message', [{
    id: '.delete',
    label: '删除消息',
  }, {
    id: '.quote',
    label: '引用回复',
  }])
}
