interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN
  if (!token) return null

  const owner = process.env.GITHUB_OWNER || "adityamzr"
  const repo = process.env.GITHUB_REPO || "tadzkirah"
  const branch = process.env.GITHUB_BRANCH || "main"

  return { token, owner, repo, branch }
}

export function isGitHubConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN
}

export function getGitHubStatus() {
  const cfg = getGitHubConfig()
  return {
    configured: !!cfg,
    owner: cfg?.owner || "adityamzr",
    repo: cfg?.repo || "tadzkirah",
    branch: cfg?.branch || "main",
  }
}

async function getFileSha(config: GitHubConfig, filePath: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Tadzkirah-CMS"
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`GitHub API error: ${res.status}`)
    }

    const data = await res.json()
    return data.sha || null
  } catch {
    return null
  }
}

export async function commitFileToGitHub(
  filePath: string,
  content: string,
  message: string
): Promise<{ success: boolean; error?: string; url?: string }> {
  const config = getGitHubConfig()
  if (!config) {
    return { success: false, error: "GitHub tidak dikonfigurasi - GITHUB_TOKEN tidak ada" }
  }

  try {
    // Clean filePath - remove leading slash and ensure it's relative
    const cleanPath = filePath.replace(/^\/+/, '').replace(/^content\//, 'content/')

    const sha = await getFileSha(config, cleanPath)

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${cleanPath}`
    
    const body = {
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: config.branch,
      ...(sha ? { sha } : {})
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Tadzkirah-CMS"
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GitHub commit gagal (${res.status}): ${err}`)
    }

    const result = await res.json()
    return { success: true, url: result.content?.html_url }

  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function deleteFileFromGitHub(
  filePath: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const config = getGitHubConfig()
  if (!config) {
    return { success: false, error: "GitHub tidak dikonfigurasi" }
  }

  try {
    const cleanPath = filePath.replace(/^\/+/, '')
    const sha = await getFileSha(config, cleanPath)

    if (!sha) {
      return { success: false, error: "File tidak ditemukan di GitHub" }
    }

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${cleanPath}`

    const body = {
      message,
      sha,
      branch: config.branch,
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Tadzkirah-CMS"
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GitHub delete gagal (${res.status}): ${err}`)
    }

    return { success: true }

  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

// Helper to determine file path for a content entry
export function getFilePathForEntry(entry: { type: string; slug: string; id: string }): string {
  // Map type to folder
  const folderMap: Record<string, string> = {
    quran: 'quran',
    hadith: 'hadith',
    dua: 'dua',
    reminder: 'reminders',
    reflection: 'reflections',
    // aliases
    hadis: 'hadith',
    doa: 'dua',
    pengingat: 'reminders',
  }

  const folder = folderMap[entry.type.toLowerCase()] || entry.type.toLowerCase()
  const fileName = `${entry.slug || entry.id}.json`

  return `content/${folder}/${fileName}`
}
