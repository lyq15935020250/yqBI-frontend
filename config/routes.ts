export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
    ],
  },
  { path: '/', redirect: '/add_chart' },
  { name: '智能分析', path: '/add_chart', icon: 'barChart', component: './AddChart' },
  { name: '智能分析（异步）', path: '/add_chart_async', icon: 'barChart', component: './AddChartAsync' },
  { name: '我的图标', path: '/my_chart', icon: 'pieChart', component: './MyChart' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
