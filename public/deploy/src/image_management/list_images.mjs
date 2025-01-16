#!/usr/bin/env node

import { exec } from 'child_process';
import Table from 'cli-table3';
import { spinner, log } from '@clack/prompts';
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url';


const __dirname = dirname(fileURLToPath(import.meta.url));

// Função principal
const main = async () => {

  const s = spinner();
  s.start('Fetching and generating table...');
  // Executa os scripts de fetch
  const remoteImages = await runFetchScript('./fetch_remote_image.mjs');
  const localImages = await runFetchScript('./fetch_local_image.mjs');
  s.stop('Images fetched successfully!');

  // Combina e processa as imagens
  const combinedImages = [];

  // Adiciona imagens remotas com marcação
  remoteImages.forEach((remote) => {
    combinedImages.push({
      repository: remote.repository,
      tag: remote.tag,
      created: remote.created,
      size: remote.size || 'N/A',
      arch: remote.arch,
      dockerVersion: remote.dockerVersion,
      nodeVersion: remote.nodeVersion,
      remote: '✅',
      local: localImages.some((local) => local.tag === remote.tag) ? '✅' : '❌',
    });
  });

  // Adiciona imagens locais que não estão no servidor
  localImages.forEach((local) => {
    if (!remoteImages.some((remote) => remote.tag === local.tag)) {
      combinedImages.push({
        repository: '',
        tag: local.tag,
        created: local.created,
        size: local.size,
        arch: local.arch,
        dockerVersion: local.dockerVersion,
        nodeVersion: local.nodeVersion,
        remote: '❌',
        local: '✅',
      });
    }
  });

  // Ordena por data de criação (mais recente primeiro)
  combinedImages.sort((a, b) => new Date(b.created) - new Date(a.created));

  // Monta a tabela
  const table = new Table({
    head: ['Repository', 'Tag', 'Created', 'Size', 'Arch', 'Docker Version', 'Node Version', 'Remote', 'Local'],
    // colWidths: [40, 20, 20, 10, 20, 20, 10, 10],
  });

  combinedImages.forEach((img) => {
    table.push([
      img.repository,
      img.tag,
      formatDate(img.created),
      img.size,
      img.arch,
      img.dockerVersion,
      img.nodeVersion,
      img.remote,
      img.local,
    ]);
  });

  console.log(table.toString());
};


/**
 * Executes a fetch script and returns its JSON output.
 * @param {string} scriptName - The script name relative to the current file.
 * @returns {Promise<Object>} The JSON output of the script.
 */
function runFetchScript(scriptName) {

  const scriptPath = resolve(__dirname, scriptName);

  return new Promise((resolve, reject) => {

    exec(`node ${scriptPath}`, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (err) {
        log.error(err.message);
        reject(err);
      }
    });
  });
}

// Função para formatar data no formato DD/MM/YYYY h:m
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}h${minutes}`;
};


main();
