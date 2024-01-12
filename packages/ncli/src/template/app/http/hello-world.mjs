/**
 * **Created on 05/01/2024**
 *
 * apps/main/controllers/helloWorld.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file Helloworld Demo
 */
import { HttpController, createLogger, Config } from '@agtm/node-framework'

const logger = createLogger('HelloWorld')

/**
 *
 */
export default class HelloWorldController extends HttpController {


  async pre () {
    // logger.info('Executando Middleware Pre...')
    // await sleep(10000)
    //
    // this.use(async (req, res, next) => {
    //   // Aguarda 1 segundo
    //   logger.info('Executando Middleware do Express...')
    //   await sleep(10000)
    //   logger.info('Middleware executado!')
    //
    //   // Obrigatório executar no final
    //   next()
    // })

    // Você pode manipular rotas do controller aqui!!! Pode ser usado para criar uma autenticação prévia
    // Rota pode ser acessado via "this.router"
    // Documentação como utilizar a rota usada no framework aqui:
    //          https://expressjs.com/pt-br/guide/routing.html#express-router
    //          https://expressjs.com/pt-br/guide/using-middleware.html
    // Autenticação:
    //          https://scotch.io/tutorials/route-middleware-to-check-if-a-user-is-authenticated-in-node-js
  }

  /**
   * Post Middleware.
   */
  async pos () {
    setTimeout(() => {
      logger.info(`Seu novo projeto está online! Acesse pela url: http://localhost:${Config.get('httpServer.port')}`)
    }, 2000)
  }

  /**
   * Route Configuration.
   */
  async setup () {
    this.get('/', async (request, response) => {
      // partials e cache são atributos especiais que permitem configurar o modelo
      const renderedPage = await this.view('helloWorld.html', {
        title: 'Hello World - Node Framework',
        body: 'Hello World - Node Framework',
        partials: { p: 'partial' },
        cache: false
      })

      response
        .status(200)
        .send(renderedPage)
    })
  }
}
