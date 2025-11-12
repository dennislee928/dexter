# Dexter 🤖

Dexter is an autonomous financial research agent that thinks, plans, and learns as it works. It performs analysis using task planning, self-reflection, and real-time market data. Think Claude Code, but built specifically for financial research.


<img width="979" height="651" alt="Screenshot 2025-10-14 at 6 12 35 PM" src="https://github.com/user-attachments/assets/5a2859d4-53cf-4638-998a-15cef3c98038" />

## Overview

Dexter takes complex financial questions and turns them into clear, step-by-step research plans. It runs those tasks using live market data, checks its own work, and refines the results until it has a confident, data-backed answer.  

**Key Capabilities:**
- **Intelligent Task Planning**: Automatically decomposes complex queries into structured research steps
- **Autonomous Execution**: Selects and executes the right tools to gather financial data
- **Self-Validation**: Checks its own work and iterates until tasks are complete
- **Real-Time Financial Data**: Access to income statements, balance sheets, and cash flow statements
- **Safety Features**: Built-in loop detection and step limits to prevent runaway execution

[![Twitter Follow](https://img.shields.io/twitter/follow/virattt?style=social)](https://twitter.com/virattt)

### Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) package manager
- Docker (required when running LocalAI locally)
- OpenAI API key (get [here](https://platform.openai.com/api-keys)) **or** a LocalAI container
- Financial Datasets API key (get [here](https://financialdatasets.ai))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/virattt/dexter.git
cd dexter
```

2. Install dependencies with uv:
```bash
uv sync
```

3. Set up your environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your API keys or LocalAI settings
```

#### Using OpenAI (default)

No additional changes are required beyond setting `OPENAI_API_KEY`.

#### Using LocalAI

1. Launch LocalAI (example with Docker):
   ```bash
   docker run -ti --name local-ai -p 9015:8080 -e THREADS=16 localai/localai:latest
   ```
   LocalAI exposes an OpenAI-compatible API on `http://localhost:9015/v1` by default.

2. Update your `.env`:
   ```
   LLM_PROVIDER=localai
   LOCALAI_BASE_URL=http://localhost:9015/v1
   # Optional: override the default model exposed by LocalAI
   # LOCALAI_MODEL=phi-3-mini
   ```

3. (Optional) If you keep LocalAI behind a proxy or need authentication, set `LOCALAI_API_KEY`.

### Local Web 控制台（Next.js）

Dexter 內建一個 Next.js Web 介面，可在本機操作 LocalAI：

```bash
cd frontend
npm install
npm run dev
```

瀏覽器開啟 `http://localhost:3000` 即可使用。預設會連線至 `http://localhost:9015/v1`，可透過 `.env.local` 覆寫：

```
LOCALAI_BASE_URL=http://localhost:9015/v1
LOCALAI_API_KEY=localai
```

Web 介面提供：
- 模型列表與切換
- System Prompt 編輯
- LocalAI 對話視窗與對話歷史
- 檔案上傳代理
- 基本使用統計（訊息數、估計 tokens、檔案數）

### Docker Compose 部署

Dexter 提供完整的 Docker Compose 設定，可一鍵啟動 LocalAI、後端與前端服務：

```bash
# 建立 .env 檔案（參考 env.example）
cp env.example .env

# 編輯 .env，設定必要的環境變數
# LLM_PROVIDER=localai
# LOCALAI_API_KEY=localai-docker
# FINANCIAL_DATASETS_API_KEY=your-key-here

# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止所有服務
docker-compose down
```

服務端點：
- **前端 GUI**: http://localhost:3000
- **LocalAI API**: http://localhost:9015/v1
- **後端 CLI**: 透過 `docker-compose exec backend dexter-agent` 執行

Docker Compose 包含三個服務：
1. **localai**: LocalAI 服務（使用官方 image `localai/localai:latest`）
2. **backend**: Dexter Python 後端（從 `Dockerfile.backend` 構建）
3. **frontend**: Next.js Web 介面（從 `frontend/Dockerfile` 構建）

所有服務會自動等待 LocalAI 健康檢查通過後才啟動，確保依賴順序正確。

### Usage

Run Dexter in interactive mode:
```bash
uv run dexter-agent
```

### Example Queries

Try asking Dexter questions like:
- "What was Apple's revenue growth over the last 4 quarters?"
- "Compare Microsoft and Google's operating margins for 2023"
- "Analyze Tesla's cash flow trends over the past year"
- "What is Amazon's debt-to-equity ratio based on recent financials?"

Dexter will automatically:
1. Break down your question into research tasks
2. Fetch the necessary financial data
3. Perform calculations and analysis
4. Provide a comprehensive, data-rich answer

## Architecture

Dexter uses a multi-agent architecture with specialized components:

- **Planning Agent**: Analyzes queries and creates structured task lists
- **Action Agent**: Selects appropriate tools and executes research steps
- **Validation Agent**: Verifies task completion and data sufficiency
- **Answer Agent**: Synthesizes findings into comprehensive responses

## Project Structure

```
dexter/
├── src/
│   ├── dexter/
│   │   ├── agent.py      # Main agent orchestration logic
│   │   ├── model.py      # LLM interface
│   │   ├── tools.py      # Financial data tools
│   │   ├── prompts.py    # System prompts for each component
│   │   ├── schemas.py    # Pydantic models
│   │   ├── utils/        # Utility functions
│   │   └── cli.py        # CLI entry point
├── pyproject.toml
└── uv.lock
```

## Configuration

Dexter supports configuration via the `Agent` class initialization:

```python
from dexter.agent import Agent

agent = Agent(
    max_steps=20,              # Global safety limit
    max_steps_per_task=5       # Per-task iteration limit
)
```

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

**Important**: Please keep your pull requests small and focused.  This will make it easier to review and merge.


## License

This project is licensed under the MIT License.

