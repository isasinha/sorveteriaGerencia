export class LoginModel{
    usuario?: string;
    senha?: string;


    static newLogin(){
        const login = new LoginModel();

        return login;
    }
}

