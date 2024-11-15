const fetch = require('node-fetch');  // 正确引入 fetch

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // GitHub Token
const REPO_OWNER = 'gchenjiachen'; // GitHub 用户名
const REPO_NAME = 'visit-counter'; // 仓库名
const ISSUE_NUMBER = 1; // Issue 编号

exports.handler = async function (event, context) {
  const issueUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}`;
  console.log(`Fetching issue from: ${issueUrl}`); // 调试信息：打印请求的 URL

  try {
    // 获取 issue 数据
    const response = await fetch(issueUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('GitHub API request failed with status:', response.status);
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const issueData = await response.json();
    console.log('Fetched issue data:', issueData); // 调试信息：打印获取到的 issue 数据

    let visitCount = parseInt(issueData.body || '0', 10); // 获取当前访问量
    console.log('Current visit count:', visitCount); // 调试信息：打印当前访问量

    visitCount++; // 访问量加一

    // 更新访问量
    const updateResponse = await fetch(issueUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: visitCount.toString(), // 更新访问量
      }),
    });

    if (!updateResponse.ok) {
      console.error('GitHub API update failed with status:', updateResponse.status);
      throw new Error(`Failed to update GitHub issue: ${updateResponse.statusText}`);
    }

    console.log('Updated visit count:', visitCount); // 调试信息：打印更新后的访问量

    return {
      statusCode: 200,
      body: JSON.stringify({ count: visitCount }), // 返回更新后的访问量
    };
  } catch (error) {
    console.error('Error in Lambda function:', error); // 打印错误信息
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
