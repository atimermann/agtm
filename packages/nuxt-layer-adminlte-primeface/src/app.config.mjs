// AdminLte 3 Configuration Template
export default {
  template: {
    login: {
      enabled: false
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
          link: '/logout',
          iconClasses: [
            'pi',
            'pi-sign-out'
          ]
        }

      ]
    }
  }
}
