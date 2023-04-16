import { exec as execAsync } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { glob } from 'glob'
import config from '~~/config'

const exec = promisify(execAsync)

interface EpisodeDatum {
  season: number
  episode: number
  name: string
  overview: string
  filename: string
  lengthSec: number
}

interface JoinedEpisodeDatum {
  season: number
  episode: number
  name: string
  overview: string
  filename: string
}

interface InitialEpisodeDatum {
  season: number
  episode: number
  name: string
  overview: string
}

interface FileEpisodeDatum {
  season: number
  episode: number
  filename: string
}

const seasonEpisodeRegex =
  /^.*?([sS](eason)?)?(?<season>\d+)(.|([eE](pisode)?)?)(?<episode>\d+).*?\.(mkv|mp4)$/

async function ffprobeLength(videoPath: string) {
  return parseFloat(
    (
      await exec(
        `ffprobe -i "${videoPath}" -show_entries format=duration -v quiet -of csv="p=0"`
      )
    ).stdout
  )
}

async function lsAllFiles(dir: string): Promise<FileEpisodeDatum[]> {
  const globPattern = path.join(dir, '**/*.{mkv,mp4}')
  const globbed = await glob(globPattern)
  const fileData: FileEpisodeDatum[] = []
  globbed.forEach((filename, _index, _arr) => {
    const match = seasonEpisodeRegex.exec(path.basename(filename))
    if (match && match.length > 0 && match.groups) {
      fileData.push({
        season: parseInt(match?.groups.season),
        episode: parseInt(match?.groups.episode),
        filename,
      })
    }
  })
  return fileData
}

function joinFileData(
  episodeData: InitialEpisodeDatum[],
  fileData: FileEpisodeDatum[]
): JoinedEpisodeDatum[] {
  const filledData: JoinedEpisodeDatum[] = []
  episodeData.forEach((initialData) => {
    const found = fileData.find(
      (fileData) =>
        initialData.season === fileData.season &&
        initialData.episode === fileData.episode
    )
    if (!found) {
      const errorMessage = "Couldn't find file for S" +
          initialData.season +
          'E' +
          initialData.episode
      if (config.allowMissingEpisodes) {
        console.warn(errorMessage);
      }
      else {
        throw new Error(errorMessage)
      }
    } else {
      filledData.push({ ...found, ...initialData })
    }
  })
  return filledData
}

async function findFiles(
  episodeData: InitialEpisodeDatum[],
  fileData: FileEpisodeDatum[]
): Promise<EpisodeDatum[]> {
  return await Promise.all(
    joinFileData(episodeData, fileData).map((ep) => {
      return ffprobeLength(ep.filename).then((lengthSec) => {
        return { ...ep, lengthSec }
      })
    })
  )
}

export { findFiles, lsAllFiles }
