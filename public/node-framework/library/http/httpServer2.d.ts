import type { LoggerInterface } from "../loggers/logger.interface.js";
export type UserClassFileDescription = {
    path: string;
    app: string;
    id: string;
    type?: string;
};
export default class HttpServer {
    private readonly logger;
    private readonly server;
    /**
     * Construtor
     *
     * @param logger
     */
    constructor(logger: LoggerInterface);
    /**
     * Inicia Servidor httpServer2 (baseado no Fastify, especializado em API Rest)
  
     * @param application   Application Legada
     * @param port          Porta do servidor (TODO Mudar para carregar do config/env)
     */
    run(application: any, port?: number): Promise<void>;
    /**
     *  Carrega todos os rotas definidos pelos apps
     */
    private loadRouters;
    /**
     *  Carrega Descrição de todos os arquivos usados para instanciar clases do usuário
     *
     *  TODO: Simplificar / Reformatar / separar em métodos ou até criar uma classe só pra ele
     *
     * @param AppDirPath    Caminho do diretório onde os apps estão localizados
     * @param filePattern   Expressã regular que define extensão dos arquivos que serão carregados
     */
    private findUserClassFilesInAppDir;
    /**
     *  Carrega descrição de todos os arquivos de um diretório especifico e subdiretórios
     *
     *   TODO: Simplificar / Reformatar / separar em métodos ou até criar uma classe só pra ele
     *
     * @param targetDirectory             Diretório alvo
     * @param filePattern                 Padrão de extensão de arquivo para buscar
     * @param userClassFileDescriptions   Descritor de arquivos encontrado (vai ser modificado)
     * @param appName                     Nome do App
     * @private
     */
    private findUsereClassFilesInDirectory;
    /**
     *  Imprime tabela de referencia de id para cada rota, pode ser usada para configurar o schema
     *
     * @param userClassFileDescriptions   Descritor do arquivo carregado
     */
    private logIdSchemaMap;
    /**
     * Gera rotas automaticamente baseado nos arquivos .auto.ts, estentendo caso necessário
     */
    private generateAutoRoutes;
}
