import { createInterface as createReadlineInterface } from 'node:readline';

async function readBoard() {
    const board = []

    for await (const line of createReadlineInterface({ input: process.stdin })) {
        board.push(line.split(''))
    }

    return board
}

function createBoardAfter(board, m) {
    const h = board.length
    const w = board[0].length

    const newboard = Array(h).fill().map(() => Array(w).fill())

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            newboard[i][j] = board[i][j] === '#' ? '#' : '.'
        }
    }

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (board[i][j] === '>') {
                newboard[i][(j - 1 + m) % (w - 2) + 1] = '>'
            }

            if (board[i][j] === '<') {
                newboard[i][((j - 1 - m) % (w - 2) + (w - 2)) % (w - 2) + 1] = '<'
            }

            if (board[i][j] === 'v') {
                newboard[(i - 1 + m) % (h - 2) + 1][j] = 'v'
            }

            if (board[i][j] === '^') {
                newboard[((i - 1 - m) % (h - 2) + (h - 2)) % (h - 2) + 1][j] = '^'
            }
        }
    }

    return newboard
}

function calculatePathDuration(board, s, d, mo = 0) {
    const h = board.length
    const w = board[0].length

    const dp = Array(h).fill().map(() => Array(w).fill(-1))

    dp[s[0]][s[1]] = 0

    for (let m = 0; dp[d[0]][d[1]] === -1; m++) {
        const mboard = createBoardAfter(board, mo + m + 1)
        const update = []

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (dp[i][j] === m) {
                    for (const [di,dj] of [[0,0],[-1,0],[+1,0],[0,-1],[0,+1]]) {
                        if (mboard[i + di]?.[j + dj] === '.') {
                            update.push([i + di, j + dj])
                        }
                    }
                }
            }
        }

        for (const [i,j] of update) {
            dp[i][j] = m + 1
        }
    }

    return dp[d[0]][d[1]]
}

const board = await readBoard()

const h = board.length
const w = board[0].length

const s = [0,1]
const d = [h - 1, w - 2]

let mo = 0

const m1 = calculatePathDuration(board, s, d, mo)
const m2 = calculatePathDuration(board, d, s, mo += m1)
const m3 = calculatePathDuration(board, s, d, mo += m2)

console.log(m1, m2, m3)
console.log(m1 + m2 + m3)
