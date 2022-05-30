pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import { AppStorage, onlyOwner } from '../libraries/LibAppStorage.sol';
contract UsernameFacet is IERC1155 {
	Appstorage internal s;

	bytes4 internal constant ERC1155_ACCEPTED = 0xf23a6e61; // Return value from `onERC1155Received` call if a contract accepts receipt (i.e `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`).
	bytes4 internal constant ERC1155_BATCH_ACCEPTED = 0xbc197c81; // Return value from `onERC1155BatchReceived` call if a contract accepts receipt (i.e `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`).

	function balanceOf(address account, uint256 id) external returns (uint256) {
		require (account != address(0) "ERC1155: burn addr not a valid owner");
		return s.nftBalances[account][id];
	}

	function balanceOfBatch(address[] memory accounts, uint256[] memory ids) external returns (uint256[] memory) {
		require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");
		uint256[] memory batchBalances = new uint256[](accounts.length);
		for (uint256 i = 0; i < accounts.length; ++i) {
			batchBalances[i] = balanceOf(accounts[i], ids[i]);
		}

		return batchBalances;
	}

	function setApprovalForAll(address owner, address operator, bool approved) external {
		require(owner != operator, "ERC1155: setting approval status for self");
		s.operatorApprovals[owner][operator] = approved;
		emit ApprovalForAll(owner, operator, approved); 
	}

	function isApprovedForAll(address account, address operator) public view virtual override returns (bool) {
		return _operatorApprovals[account][operator];
	}

	function safeTransferFrom(
		address from,
		address to,
		uint256 id,
		uint256 amount,
		bytes memory data
	) external  {
		require(
			from == msg.sender || isApprovedForAll(from, msg.sender),
			"ERC1155: caller is not token owner nor approved"
		);
		require(to != address(0), "ERC1155: transfer to the zero address");

		address operator = msg.sender;

		uint256[] memory ids = _asSingletonArray(id);
		uint256[] memory ids = new uint256[](1).push(id);
		uint256[] memory amounts = new uint256[](1).push(amount);

		uint256 fromBalance = s.nftBalances[id][from];
		require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
		unchecked {
			_balances[id][from] = fromBalance - amount;
		}
		_balances[id][to] += amount;

		emit TransferSingle(operator, from, to, id, amount);

		_doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
	}

	function _doSafeTransferAcceptanceCheck(
		address operator,
		address from,
		address to,
		uint256 id,
		uint256 amount,
		bytes memory data
	) private {
		if (to.isContract()) {
			try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
				if (response != IERC1155Receiver.onERC1155Received.selector) {
					revert("ERC1155: ERC1155Receiver rejected tokens");
				}
			} catch Error(string memory reason) {
				revert(reason);
			} catch {
				revert("ERC1155: transfer to non ERC1155Receiver implementer");
			}
		}
	}

	function _doSafeBatchTransferAcceptanceCheck(
		address operator,
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) private {
		if (to.isContract()) {
			try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (
				bytes4 response
			) {
				if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
					revert("ERC1155: ERC1155Receiver rejected tokens");
				}
			} catch Error(string memory reason) {
				revert(reason);
			} catch {
				revert("ERC1155: transfer to non ERC1155Receiver implementer");
			}
		}
	}
}
