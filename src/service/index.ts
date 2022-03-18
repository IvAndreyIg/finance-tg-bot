import { Transaction } from "./../model/index";
import { GoogleSpreadsheet } from "google-spreadsheet";

export class FinanceManagmentService{

    doc:Promise<GoogleSpreadsheet> 

    constructor(public sheetId:string,public authEmail:string, public authKey:string){

        //создаем промис
     this.doc=this.connect();
         
        
    }
    
    async connect(){
        const doc =new GoogleSpreadsheet(this.sheetId);
        await doc.useServiceAccountAuth({
            client_email:this.authEmail,
            private_key:this.authKey
        })

        await doc.loadInfo()
       // console.log('sheet.title', )
       // console.dir(sheet,{showHidden:true,depth:3})

       //const sheet = doc.sheetsByIndex[0]; 
       //const rows = await sheet.getRows();
     //  console.log('rows', rows[0]);


       // console.log("times123");
         
        
        return doc;
    }
    
    
    async addTransaction(t:Transaction){
        const doc=await this.doc;
        const sheet=doc.sheetsByTitle["transactions"]
        await sheet.addRow({
            date:t.date.toDateString(),
            user:t.user,
            type:t.type,
            category:t.category,
            amount:t.amount,
            comment:t.comment||""
        })
    }
}