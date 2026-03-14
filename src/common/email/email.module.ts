import { MailerModule } from "@nestjs-modules/mailer";
import { Global, Module } from "@nestjs/common";
import { join } from "path";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from "./email.service";
@Global()
@Module({
    imports:[
        MailerModule.forRoot({
        transport:{
            service:"gmail",
            auth:{
                user:"abdulaziz0azizov@gmail.com",
                pass:"qdyifvmfhxixqdrr"
            }
        },
        defaults:{
            from:`CRM <${process.env.MAIN_EMAIL}>`
        },
        template:{
            dir:join(process.cwd(),"src","templates"),
            adapter: new HandlebarsAdapter(),
            options:{
                strict:true
            }
        }
    })],
    providers:[EmailService],
    exports:[EmailService]
})
export class EmailModule{

}