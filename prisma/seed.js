const {PrismaClient} = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()
async function main() {

	const salt = bcrypt.genSaltSync(10);
	await prisma.user.create({
		data: {
			email: "admin@hotmail.com",
            password: bcrypt.hashSync("password", salt),
		},
	})
	
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
