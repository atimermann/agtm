#!/usr/bin/env node
import dotenv from 'dotenv'

dotenv.config()

const provider = process.env.NF_PRISMA_PROVIDER
const host = process.env.NF_PRISMA_HOST
const port = process.env.NF_PRISMA_PORT
const database = process.env.NF_PRISMA_DATABASE

const username = encodeURIComponent(process.env.NF_PRISMA_USERNAME)
const password = encodeURIComponent(process.env.NF_PRISMA_PASSWORD)

const options = process.env.NF_PRISMA_OPTIONS

const connectionString = `${provider}://${username}:${password}@${host}:${port}/${database}${options ? `?${options}` : ''}`
process.stdout.write(connectionString)
