import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
@Injectable()

export class EmailService{
    constructor(private readonly mailerService:MailerService){}
    async sendEmail(email:string,login:string,password:string){
        await this.mailerService.sendMail({
            to:email,

            from: process.env.MAIN_EMAIL,
            subject:"CRM tizimidan login qilish uchun !",
            template:"email",
            context:{
                login1:`
                    ${login}
                `,
                password1:`
                    ${password}
                `

                
            }
        })
    }
}

