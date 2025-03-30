# Serviço Prisma

O NodeFramework utiliza o Prisma como ORM (Object-Relational Mapping) para interagir com bancos de dados. O `PrismaService` facilita o gerenciamento da conexão e o acesso aos recursos do Prisma em toda a aplicação.

## Configuração

### Configuração Básica

A configuração do Prisma é feita através de variáveis de ambiente ou no arquivo de configuração YAML. Atualmente, o NodeFramework utiliza uma única instância do Prisma com uma configuração simplificada.

```env
# Configuração via variáveis de ambiente
NF_PRISMA_HOST="localhost"
NF_PRISMA_PORT="5432"
NF_PRISMA_DATABASE="meu_banco"
NF_PRISMA_USERNAME="usuario"
NF_PRISMA_PASSWORD="senha123"
NF_PRISMA_OPTIONS="schema=public"
```

### Implementação Futura

No futuro, o NodeFramework poderá suportar múltiplas instâncias do Prisma, o que exigirá configurações adicionais e modificações no código.

## Uso no ApiController

O `ApiController` é a classe base para todos os controllers da aplicação. Ele recebe o `PrismaService` por injeção de dependência e cria um atalho `prisma` para acesso fácil à instância do Prisma.

### Estrutura Básica

```typescript
import { ApiController } from "@agtm/node-framework"

export default class MeuController extends ApiController {
  async setup() {
    // Configura o controller (opcional)
  }

  async meuMetodo(request, reply) {
    // Acessa o prisma através do this.prisma
    const usuarios = await this.prisma.usuario.findMany()
    return usuarios
  }
}
```

### Como Funciona Internamente

O `ApiController` recebe o `PrismaService` no construtor e inicializa o `prisma` como um atalho para a instância do Prisma:

```typescript
constructor(
  protected readonly logger: LoggerInterface,
  protected readonly config: ConfigService,
  protected readonly prismaService: PrismaService,
  protected readonly fastify: FastifyInstance,
) {
}

async init(autoSchema?: AutoSchema) {
  // ...
  this.prisma = this.prismaService.getInstance();
}
```

Isso permite que os controllers derivados acessem o cliente Prisma diretamente através de `this.prisma` sem precisar chamar `this.prismaService.getInstance()` repetidamente.

## Exemplos Práticos

### Consulta Simples

```typescript
async getUsuarios() {
  return this.prisma.usuario.findMany();
}
```

### Consulta com Filtros

```typescript
async getUsuarioPorId(request)
{
  const {id} = request.params;
  return this.prisma.usuario.findUnique({
    where: {id: parseInt(id)}
  });
}
```

### Criar Registro

```typescript
async criarUsuario(request) {
  const dados = request.body;
  return this.prisma.usuario.create({
    data: dados
  });
}
```

### Atualizar Registro

```typescript
async atualizarUsuario(request) {
  const { id } = request.params;
  const dados = request.body;

  return this.prisma.usuario.update({
    where: { id: parseInt(id) },
    data: dados
  });
}
```

### Excluir Registro

```typescript
async excluirUsuario(request) {
  const { id } = request.params;

  return this.prisma.usuario.delete({
    where: { id: parseInt(id) }
  });
}
```

## Boas Práticas

1. **Use Services para lógica de negócio**: Em vez de colocar toda a lógica de acesso ao banco no controller, crie services específicos
2. **Manipule erros adequadamente**: Use try/catch para capturar e tratar erros do Prisma
3. **Use transações para operações complexas**: Para operações que envolvem múltiplas tabelas, use transações
4. **Não exponha o modelo Prisma diretamente**: Transforme os dados antes de enviá-los ao cliente
5. **Use o recurso de relações do Prisma**: Aproveite o recurso de include/select para otimizar consultas

### Tratamento de Erros com ApiError

O NodeFramework fornece a classe `ApiError` para tratamento padronizado de erros. Ao trabalhar com o Prisma, é recomendado converter os erros do Prisma em `ApiError` para uma melhor experiência do usuário e consistência na API.

```typescript
import { ApiError } from "@agtm/node-framework"

async getUserById(id: number) {
  try {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      throw new ApiError(
        `Usuário com ID ${id} não encontrado`,
        "Not Found",
        404
      )
    }
    
    return user
  } catch (error) {
    // Verifica se é um erro do Prisma
    if (error.code) {
      // P2025: Record not found
      if (error.code === "P2025") {
        throw new ApiError(
          "Registro não encontrado",
          "Not Found",
          404
        )
      }
      
      // P2002: Unique constraint failed
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "campo"
        throw new ApiError(
          `Já existe um registro com este ${field}`,
          "Conflict",
          409
        )
      }
    }
    
    // Se não é um erro tratado, repassa o erro original
    throw error
  }
}
```

