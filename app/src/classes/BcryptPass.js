import bcrypt from 'bcrypt';

export default class BcryptPass {
    
    static saltRounds = 10;
    
    static async hashPassword(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    static async checkPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}