import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private readonly jwt:JwtService){}
    canActivate(context: ExecutionContext): boolean {
    try {
            const req= context.switchToHttp().getRequest()

            let token = req.headers.authorization
            
            if(!token) throw new UnauthorizedException("Token is missing")
            if (!token.startsWith("Bearer ")) throw new UnauthorizedException("Invalid token format");

            token=token.split(" ")[1]
            
            const user=  this.jwt.verify(token,{secret:"shaftoli"})
            req["user"]=user
            return true
    } catch (error) {
            throw new UnauthorizedException("Invalid token ")
        }
    }
}