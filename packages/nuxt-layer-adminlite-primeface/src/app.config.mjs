// AdminLte 3 Configuration Template
export default {
  template: {
    login: {
      enable: false
    },
    logoPath: 'DEFAULT',
    logoLabel: 'AdminLte 3',
    version: '',
    menu: {
      items: [
        {
          title: 'Hello World'
        },
        {
          title: 'Sair',
          link: '/login',
          iconClasses: [
            'pi',
            'pi-sign-out'
          ]
        }

      ]
    }
  }
}
