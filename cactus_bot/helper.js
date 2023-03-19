const {
    MessageButton,
    Message,
    Interaction,
    MessageActionRow
  } = require('discord.js');
  const chalk = require('chalk')
  const ms = require('ms');

  
  const ai_helper = async (webhook, guild, code, message, ask) => {
  
    if (!webhook || !message) throw new Error(chalk.red.bold('Please provide all the arguments, and make sure they are valid!'))
  
    if(code.includes('```')) {
        if(code.includes('slurs')) {
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>\nThat is not an appropiate question to ask in this forum`)
        } else if(code.includes('racial')) {
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>\nThat is not an appropiate question to ask in this forum`)
        } else if (code.includes('```py')) {
          const answers = await ask(`xx`, `xx`, `in python ${code}`);
    
          const answer = answers.replace(`in python ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```js')) {
          const answers = await ask(`xx`, `xx`, `in javascript ${code}`);
    
          const answer = answers.replace(`in javascript ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```ruby')) {
          const answers = await ask(`xx`, `xx`, `in ruby ${code}`);
    
          const answer = answers.replace(`in ruby ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```java')) {
          const answers = await ask(`xx`, `xx`, `in java ${code}`);
    
          const answer = answers.replace(`in java ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```php')) {
          const answers = await ask(`xx`, `xx`, `in php ${code}`);
    
          const answer = answers.replace(`in php ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```go')) {
          const answers = await ask(`xx`, `xx`, `in go ${code}`);
    
          const answer = answers.replace(`in go ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```swift')) {
          const answers = await ask(`xx`, `xx`, `in swift ${code}`);
    
          const answer = answers.replace(`in swift ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } else if (code.includes('```sh')) {
          const answers = await ask(`xx`, `xx`, `in sh ${code}`);
    
          const answer = answers.replace(`in sh ${code}`, '');
    
          webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R> ${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`)
        } 
      
      
    } else {
        if(code.includes('slurs')) {
            webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>\nThat is not an appropiate question to ask in this forum`)
          } else if(code.includes('racial')) {
            webhook.send(`${message.author} - [Code request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>\nThat is not an appropiate question to ask in this forum`)
          } else {
      const answers = await ask(`xx`, `xx`, `${code}`);
    
          const answer = answers.replace(`${code}`, '');
    
          webhook.send(`${message.author} - [Question request reply](${message.url}) <t:${Math.floor(Date.now() / 1000)}:R>\n**•** Deleting this message <t:${Math.floor((Date.now() + ms('30s')) / 1000)}:R>${answer.length > 5900 ? answer.substring(0, 5900) + "..." : answer}`).then(async(m) => {
            setTimeout(async() => {
              m.delete()
              message.delete()
            }, 30000)
          })
        }
    }
    
  }
  
  module.exports = { ai_helper }