const {PrismaClient} = require("@prisma/client")
const express = require("express");
const app = express.Router()

const prisma = new PrismaClient()

app.get("/dashobard",async(req,res)=>{
  const invoice = await prisma.invoice.findFirst({
    orderBy:{
      createdAt:"desc"
    }
  })
  const param ={
    fetchRegister:invoice
  }
  return response.status(200).json(param)
})

app.get('/invoice', async (req, res) => {
    const invoices = await prisma.invoice.findMany()
    const invoicesUpdate = invoices.map((item)=>{
      return{
        ...item,
        dateEmition:JSON.parse(JSON.stringify(item.dateEmition)).split("T")[0],
        dateExpiration:JSON.parse(JSON.stringify(item.dateExpiration)).split("T")[0],
      }
    })
    res.status(200).json({data:invoicesUpdate})
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
    const {customer,dateEmition,dateExpiration,statePayment,totalPayment,document } = req.body
    const invoiceResponse = await prisma.invoice.create({
      data: {
        customer,
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