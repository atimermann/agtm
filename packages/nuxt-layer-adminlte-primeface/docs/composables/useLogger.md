# Composable useLogger

Este composable fornece uma utilidade de logging para a aplicação, permitindo registrar mensagens com diferentes níveis
de severidade (info, warn, error, debug). As mensagens são prefixadas com um contexto específico para facilitar a
identificação da origem dos logs.

O logging é habilitado apenas em ambiente de desenvolvimento para evitar exposição delogs em produção.

##Exemplo de uso

```vue

<script setup>
  import {useLogger} from '~/composables/useLogger'

  const {logger} = useLogger('Crontech Platform')

  logger.info('Inicializando...')
  logger.warn('Atenção, configuração incompleta!')
  logger.error('Erro ao conectar com o servidor!')
  logger.debug('Detalhes de depuração...')
</script>

```
