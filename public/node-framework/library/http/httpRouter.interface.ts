export interface HttpRouterInterface {
  post(path: string, handler: string): this
  get(path: string, handler: string): this
  put(path: string, handler: string): this
  delete(path: string, handler: string): this
  head(path: string, handler: string): this
  trace(path: string, handler: string): this
  options(path: string, handler: string): this
  patch(path: string, handler: string): this
  setup(): Promise<void>
}
