const fetch = require('node-fetch'); // 仅在 Netlify Lambda 函数中使用
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 环境变量
const REPO_OWNER = 'gchenjiachen'; // 替换为 GitHub 用户名
const REPO_NAME = 'visit-counter'; // 替换为 GitHub 仓库名
const ISSUE_NUMBER = 1; // 替换为 GitHub Issue 编号

exports.handler = async function (event, context) {
  const issueUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}`;
  try {
    // 获取访问量
    const response = await fetch(issueUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}: ${await response.text()}`);
    }

    const issueData = await response.json();
    let visitCount = parseInt(issueData.body || '0', 10);
    if (isNaN(visitCount)) visitCount = 0;
    visitCount++; // 增加访问量

    // 更新访问量
    await fetch(issueUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: visitCount.toString(),
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ count: visitCount }), // 返回当前访问量
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update visit count' }),
    };
  }
};
