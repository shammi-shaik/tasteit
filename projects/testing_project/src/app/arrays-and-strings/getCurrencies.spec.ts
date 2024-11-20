import { getCurrencies } from "./getCurrencies"

describe ('getCurrencies',()=>{
    it('should return the supported Currencies',()=>{
        const result = getCurrencies();
        expect(result).toContain('USD');
        expect(result).toContain('INR');
        expect(result).toContain('EUR');
    })
})