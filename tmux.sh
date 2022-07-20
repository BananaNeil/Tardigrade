DIR=$(pwd)
SESSIONNAME=Tardigrade
MEMNONIC=$(grep MEMNONIC ${DIR}/hardhat/.env | cut -d '=' -f 2-)
BLOCKSPEED=0
GASLIMIT=8000000
tmux new-session -s $SESSIONNAME \; \
  send-keys 'vi ${DIR}' C-m \; \
  split-window -v \; \
  send-keys "cd hardhat" C-m \; \
  split-window -v \; \
  send-keys "cd web && npm run dev" C-m \; \
  split-window -h \; \
  send-keys "cd orbit-db && npm run build" C-m \; \
  split-window -h \; \
  send-keys "ganache -i 1337 -b ${BLOCKSPEED}  --gasLimit=${GASLIMIT}  -m ${MEMNONIC}" C-m \; \

