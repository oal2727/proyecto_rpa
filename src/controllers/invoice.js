const {PrismaClient} = require("@prisma/client")
const express = require("express");
const app = express.Router()
const {verifyToken} = require("../../middleware/auth")

const prisma = new PrismaClient()

app.get("/dashboard",async(req,res)=>{
  const invoice = await prisma.invoice.findFirst({
    orderBy:{
      createdAt:"desc"
    }
  })
  
  if(invoice){
    invoice.dateEmition = JSON.parse(JSON.stringify(invoice.dateEmition)).split("T")[0]
  invoice.dateExpiration = JSON.parse(JSON.stringify(invoice.dateExpiration)).split("T")[0]
  }
  

  const param ={
    fetchRegister:invoice
  }
  return res.status(200).json(param)
})

app.get("/paymentList/:id",async(req,res)=>{
  const {id} = req.params
  const payments = await prisma.payment.findMany({
    where:{
      invoiceId:parseInt(id)
    }
  })
  console.log(payments)
  return res.status(200).json({data:payments})
})

app.post("/dashboard_kpi",async(req,res)=>{
  const type = req.body.type
  const dateInitial = req.body.dateInitial.split("-")
  const monthInitial = dateInitial[1]
  const dateFinal = req.body.dateFinal.split("-")
  const monthFinal = dateFinal[1]
  const result = await prisma.$queryRaw`
    SELECT SUM(totalPayment) as totalPayment,MONTHNAME(dateExpiration) as month,YEAR(dateExpiration) AS year
    FROM invoice 
    WHERE 
        YEAR(dateExpiration) = 2023 
        AND statePayment = ${type} AND
        MONTH(dateExpiration) BETWEEN ${monthInitial} AND ${monthFinal}
        GROUP BY year, month;
  `;

  let dataTotal= []
  let dataMeses = []
  let total = 0;
  result.forEach(element => {
    total += parseFloat(element.totalPayment)
    dataTotal.push(element.totalPayment)
    dataMeses.push(element.month)
  });
  const param ={
    totalPayment:dataTotal,
    meses:dataMeses,
    totalGeneral:total
  }
  return res.status(200).json(param)
})

app.post("/updateRecords",async(req,res)=>{
  const {data,payments} = req.body
  data.forEach(async(element)=>{
    await prisma.invoice.update({
      where: {
        id: parseInt(element.id),
      },
      data:{
        totalPending:element.totalPending,
        statePayment:element.totalPending > 0 ? "PENDIENTE" : "PAGADO"
      }
    })
  })

  payments.forEach(async(item)=>{
    await prisma.payment.create({
      data:{
        invoiceId:item.invoiceId,
        totalPayment:item.MontoPagado,
        typePayment: item.FormaDePago
      }
    })
  })
})

app.get('/invoice', async (req, res) => {
    const invoices = await prisma.invoice.findMany()
    const invoicesUpdate = invoices.map((item)=>{
      return{
        ...item,
        payment:parseFloat(item.totalPayment) - parseFloat (item.totalPending),
        dateEmition:JSON.parse(JSON.stringify(item.dateEmition)).split("T")[0],
        dateExpiration:JSON.parse(JSON.stringify(item.dateExpiration)).split("T")[0],
      }
    })
    console.log(invoicesUpdate)
    return res.status(200).json({data:invoicesUpdate})
  })

app.post("/detail/month",async(req,res)=>{
  const {month,type} = req.body
  console.log(type)
    const response = await prisma.$queryRaw`
        SELECT id,customer,document,dateEmition,dateExpiration,totalPayment FROM invoice
        WHERE 
          YEAR(dateExpiration) = 2023 AND statePayment = ${type}
          AND MONTHNAME(dateExpiration)=${month};
    `;
    let total = 0
    response.forEach(element => {
      total += parseFloat(element.totalPayment)
    }); 

    const detailUpdated = response.map((item)=>{
      return{
        ...item,
        dateEmition:JSON.parse(JSON.stringify(item.dateEmition)).split("T")[0],
        dateExpiration:JSON.parse(JSON.stringify(item.dateExpiration)).split("T")[0],
      }
    })
    const param = {
      totalGeneral:total,
      detail:detailUpdated,
    }
   
    return res.status(200).json({data:param})
})

app.delete('/invoice/:id', async (req, res) => {
    const {id} = req.params
    await prisma.invoice.delete({
        where: {
          id: parseInt(id),
        },
      })
    res.status(200).json({message:"delete success"})
  })

  app.put('/invoice/:id', async (req, res) => {
    const {id} = req.params
    await prisma.invoice.update({
        where: {
          id: parseInt(id),
        },
        data:{
          statePayment:"PAGADO"
        }
      })
    res.status(200).json({message:"success"})
  })

app.post('/invoice', async (req, res) => {
  console.log(req.body)
    const {customer,dateEmition,dateExpiration,statePayment,totalPayment,document,ruc } = req.body
    const invoiceResponse = await prisma.invoice.create({
      data: {
        customer,
        ruc,
        dateEmition:new Date(dateEmition),
        dateExpiration:new Date(dateExpiration),
        document,
        statePayment:"CREDITO",
        totalPayment:parseFloat(totalPayment.replace(",",""))
      },
    })

    invoiceResponse.dateEmition = JSON.parse(JSON.stringify(invoiceResponse.dateEmition)).split("T")[0]
    invoiceResponse.dateExpiration = JSON.parse(JSON.stringify(invoiceResponse.dateExpiration)).split("T")[0]

    return res.status(200).json({message:invoiceResponse})
})


module.exports = app;