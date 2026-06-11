import sharp from "sharp"

const images = [
	"teacher.webp",
	"teacherHi.webp",
	"student.webp",
	"studentHi.webp",
]

for (const image of images) {
	const input = `public/images-original/${image}`,
	 output = `public/images/${image}`

	await sharp(input)
		.resize({
			width: 760,
			withoutEnlargement: true,
		})
		.webp({
			quality: 68,
			effort: 6,
		})
		.toFile(output)

	console.log(`optimized ${image}`)
}