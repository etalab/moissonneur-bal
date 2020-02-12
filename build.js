#!/usr/bin/env node --max_old_space_size=8192
require('dotenv').config()
const {join} = require('path')
const {emptyDir} = require('fs-extra')
const Keyv = require('keyv')
const bluebird = require('bluebird')
const {uniq} = require('lodash')
const chalk = require('chalk')
const {extractAsTree} = require('@etalab/bal')
const {expandMetaWithResults} = require('./lib/meta')
const {getCommune} = require('./lib/cog')
const {createCsvFilesWriter} = require('./lib/exports/csv')
const {computeList} = require('./lib/sources')
const {processSource} = require('./lib/processing')
const {endFarms} = require('./lib/util/farms')

const db = new Keyv('sqlite://bal.sqlite')
const distPath = join(__dirname, 'dist')

async function main() {
  const sources = await computeList()
  const globalCommunes = new Set()
  let adressesCount = 0
  let erroredAdressesCount = 0

  await emptyDir(distPath)
  const csvFiles = createCsvFilesWriter(distPath)

  await db.clear()

  const datasets = await bluebird.map(sources, async source => {
    const {data, errored, report} = await processSource(source)

    data.forEach(r => {
      r.licence = source.meta.license
    })
    const codesCommunes = uniq(data.map(c => c.codeCommune))

    console.log(chalk.green(` * ${source.meta.title} (${source.meta.model})`))
    console.log(chalk.gray(`    Adresses trouvées : ${data.length}`))
    console.log(chalk.gray(`    Communes : ${codesCommunes.length}`))
    if (errored) {
      console.log(chalk.red(`    Lignes avec erreurs : ${errored}`))
      erroredAdressesCount += errored
    }

    const tree = extractAsTree(data)
    expandMetaWithResults(source.meta, {tree, report, errored})
    await db.set(`${source.meta.id}-data`, tree)
    if (report) {
      await db.set(`${source.meta.id}-report`, report)
    }

    data.forEach(r => csvFiles.writeRow(r))
    adressesCount += data.length
    codesCommunes.forEach(c => globalCommunes.add(c))
    return source.meta
  }, {concurrency: 8})

  await db.set('datasets', datasets)

  await csvFiles.finish()

  /* Compute and display metrics */

  console.log(`${globalCommunes.size} communes couvertes !`)
  console.log(`Adresses acceptées : ${adressesCount}`)
  console.log(`Adresses avec erreurs : ${erroredAdressesCount}`)

  const populationCount = [...globalCommunes].reduce((acc, codeCommune) => {
    const commune = getCommune(codeCommune)
    if (commune && commune.population) {
      return acc + commune.population
    }

    return acc
  }, 0)

  console.log(`Population couverte : ${populationCount}`)

  endFarms()
}

main().catch(error => {
  console.error(error)
  endFarms()
  process.exit(1)
})
