# utils
Ferramentas utilitárias simples.

# Multi
A classe `Multi` fornece um mecanismo para implementar a herança múltipla em JavaScript.

Baseado neste artigo: https://www.mundojs.com.br/2018/07/20/heranca-multipla-com-javascript/

## Uso

A herança múltipla permite que uma classe herde comportamentos e características de várias classes base. Em JavaScript, isso não é suportado nativamente, mas pode ser realizado com a ajuda da classe `Multi`.

Para usar a classe `Multi`, você deve seguir os seguintes passos:

1. Importe a classe `Multi` no seu código.

```javascript
import { Multi } from '@agtm/util'; // Ajuste o caminho do import de acordo com sua estrutura de arquivos
```

2. Crie as classes base que você deseja usar.

```javascript
class ClassA {
  methodA() {
    return 'Hello from ClassA';
  }
}

class ClassB {
  methodB() {
    return 'Hello from ClassB';
  }
}
```

3. Use o método `inherit` da classe `Multi` para criar uma nova classe que herda de ambas as classes base.

```javascript
const MultiClass = Multi.inherit(ClassA, ClassB);
```

4. Agora, você pode criar uma instância da classe `MultiClass` e usar métodos de ambas as classes base.

```javascript
const instance = new MultiClass();

console.log(instance.methodA()); // "Hello from ClassA"
console.log(instance.methodB()); // "Hello from ClassB"
```

## Notas

- Se houver conflitos de nomes entre métodos ou propriedades das classes base, a versão da última classe base fornecida ao método `inherit` prevalecerá.
- Os métodos e propriedades estáticos das classes base também serão herdados.
- Esta classe foi desenvolvida para ser utilizada com classes ES6 e pode não funcionar corretamente com funções construtoras ES5 ou objetos prototipais.
