# DeepSeek API pricing notes

Checked 2026-08-26.

Official pricing source: https://api-docs.deepseek.com/quick_start/pricing/

The official docs list deepseek-v4-flash, deepseek-v4-pro, and deepseek-v4-flash-vision-exp. Prices are per 1M tokens and vary by peak/off-peak hours and cache hit/miss. For deepseek-v4-flash: cache-hit input is $0.007/M off-peak and $0.014/M peak; cache-miss input is $0.22/M off-peak and $0.44/M peak; output is $0.66/M off-peak and $1.32/M peak. For deepseek-v4-pro: cache-hit input is $0.022/M off-peak and $0.044/M peak; cache-miss input is $0.66/M off-peak and $1.32/M peak; output is $1.98/M off-peak and $3.96/M peak. Off-peak rates are half of peak rates. The docs state that expense equals tokens multiplied by price, deducted from topped-up/granted balance, and prices may change.

Official API overview: https://api-docs.deepseek.com/

The API is OpenAI-compatible at https://api.deepseek.com and supports JSON output. Current model names in the docs are deepseek-v4-flash, deepseek-v4-pro, and deepseek-v4-flash-vision-exp.
