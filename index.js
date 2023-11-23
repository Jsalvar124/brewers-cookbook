import express from "express";
import fs from "node:fs/promises"

const app = express();

app.use(express.urlencoded({ extended: false }))

const { readFile } = fs;

const getDataFromJson = async () => {
    try {
        const rawData = await readFile('./bjcp_styleguide-2021.json', { encoding: 'utf8' })
        const jsonData = JSON.parse(rawData); // turn into a js object, it comes as a string, not accesible by JS.
        const { styles, version } = jsonData.beerjson
        return styles
    } catch (error) {
        console.log({ "ErrorMessage": error })
    }
}

const PORT = process.env.PORT ?? 3000;

app.get('/', (req,res)=>{
    res.json({Message: "Welcome to the Brewer's Cook Book"})
})

app.get('/beers', async (req, res) => {
    const search = req.query.search?.toLocaleLowerCase()
    if (search) {
        console.log(`seach query: ${search}`)
        const beers = await getDataFromJson()
        const filterSearch = beers.filter(beer => beer.name.toLocaleLowerCase().includes(search))
        return res.json({
            totalResults: filterSearch.length,
            filterSearch
        })
    }
    const beers = await getDataFromJson()
    return res.json({
        total: beers.length,
        beers
    })
    // const beerNames = beers.map(beer => beer.name)
})

app.get('/categories', async (req, res) => {
    const beers = await getDataFromJson()
    const uniqueCategories = [...new Set(beers.map(beer => beer.category))]
    const beerCategories = uniqueCategories.map(function (categoryName) {
        const beer = beers.find((beer) => beer.category === categoryName);
        return {
            "category": beer.category,
            "category_id": beer.category_id,
            "description": beer.category_description
        }
    })
    res.json({
        total: beerCategories.length,
        beerCategories})
})


app.listen(PORT, () => {
    console.log(`running on port ${PORT}, http://localhost:${PORT}`)
})
