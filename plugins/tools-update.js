const config = require('../config');
let fs = require('fs');
const { execSync } = require('child_process');
const { cmd } = require('../command');


cmd({ 
  pattern: "update", 
  react: "🔄", 
  desc: "Update bot", 
  category: "system", 
  use: '.update', 
  filename: __filename 
}, async (conn, mek, m, { from, reply }) => { 
  try { 
    await conn.sendMessage(from, { text: '📡 Please wait... Checking for SUBZERO updates...' }, { quoted: mek });
    
    if (!fs.existsSync('./.git')) { 
      console.log("Initializing git repository..."); 
      execSync('git init'); 
      execSync('git remote add origin https://github.com/mrfrank-ofc/SUBZERO.git'); 
    } else { 
      console.log("Checking existing remotes..."); 
      const remotes = execSync('git remote').toString().split('\n').filter(r => r.trim()); 
      if (!remotes.includes('origin')) { 
        execSync('git remote add origin https://github.com/mrfrank-ofc/SUBZERO.git'); 
      } 
    }
    
    console.log("Fetching updates..."); 
    execSync('git fetch origin'); 
    
    console.log("Checking remote branches..."); 
    let defaultBranch = null; 
    const branches = execSync('git ls-remote --heads origin').toString(); 
    if (branches.includes('refs/heads/main')) { 
      defaultBranch = 'main'; 
    } else if (branches.includes('refs/heads/master')) { 
      defaultBranch = 'master'; 
    } else { 
      throw new Error("Could not determine the default branch."); 
    }
    
    console.log(`Using ${defaultBranch} as the default branch.`); 
    
    const localCommit = execSync('git rev-parse HEAD').toString().trim(); 
    const originCommit = execSync(`git rev-parse origin/${defaultBranch}`).toString().trim();
    
    if (localCommit === originCommit) { 
      await conn.sendMessage(from, { text: '*✅ Subzero Bot is already up to date!*' }, { quoted: mek });
    } else { 
      console.log("Resetting to origin state..."); 
      execSync(`git reset --hard origin/${defaultBranch}`); 
      console.log("Pulling updates..."); 
      execSync(`git pull origin ${defaultBranch}`); 
      await conn.sendMessage(from, { text: '*✅ Subzero Bot updated successfully!*' }, { quoted: mek });
    }
  } catch (error) { 
    console.error(error); 
    reply(`*Error during update:* ${error.message}`); 
  }
});
/*
const config = require('../config');
const fs = require('fs');
const https = require('https');
const { cmd } = require('../command');
const unzipper = require('unzipper'); // For unzipping files

cmd({
  pattern: "update",
  react: "🗜️",
  desc: "Update bot",
  category: "system",
  use: '.update',
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    await conn.sendMessage(from, { text: 'Please wait... Downloading and updating bot files...' }, { quoted: mek });

    // Define the GitHub repository ZIP file URL
    const repoUrl = "https://github.com/mrfrank-ofc/SUBZERO-V1/archive/refs/heads/main.zip";
    const zipFilePath = './update.zip';

    console.log("Downloading latest bot files...");
    await downloadFile(repoUrl, zipFilePath);

    console.log("Extracting files...");
    await extractZip(zipFilePath, './');

    console.log("Cleaning up...");
    fs.unlinkSync(zipFilePath);

    await conn.sendMessage(from, { text: '*✅ Bot updated successfully!*' }, { quoted: mek });
  } catch (error) {
    console.error(error);
    reply(`*Error during update:* ${error.message}`);
  }
});

// Helper function to download the file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
      }
    }).on('error', (error) => {
      fs.unlink(dest, () => reject(error));
    });
  });
}

// Helper function to extract the ZIP file
function extractZip(zipPath, extractTo) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractTo }))
      .on('close', resolve)
      .on('error', reject);
  });
}
*/
