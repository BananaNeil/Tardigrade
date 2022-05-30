pragma solidity 0.8.13;

import "../interfaces/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import { LibAppStorage, AppStorage, Modifiers } from '../libraries/LibAppStorage.sol';
contract UsernameFacet is IERC1155, Modifiers {
  using Address for address;

	bytes4 internal constant ERC1155_ACCEPTED = 0xf23a6e61; // Return value from `onERC1155Received` call if a contract accepts receipt (i.e `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`).
	bytes4 internal constant ERC1155_BATCH_ACCEPTED = 0xbc197c81; // Return value from `onERC1155BatchReceived` call if a contract accepts receipt (i.e `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`).

	function balanceOf(address account, uint256 id) external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
		require (account != address(0), "ERC1155: burn addr not a valid owner");
		return s.nftBalances[id][account];
	}

	function balanceOfBatch(address[] memory accounts, uint256[] memory ids) external view returns (uint256[] memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
		require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");
		uint256[] memory batchBalances = new uint256[](accounts.length);
		for (uint256 i = 0; i < accounts.length; ++i) {
			batchBalances[i] = s.nftBalances[ids[i]][accounts[i]];
		}

		return batchBalances;
	}

	function setApprovalForAll(address operator, bool approved) external {
    AppStorage storage s = LibAppStorage.diamondStorage();
		require(msg.sender != operator, "ERC1155: setting approval status for self");
		s.operatorApprovals[msg.sender][operator] = approved;
		emit ApprovalForAll(msg.sender, operator, approved); 
	}

	function isApprovedForAll(address account, address operator) public view virtual override returns (bool) {
    AppStorage storage s = LibAppStorage.diamondStorage();
		return s.operatorApprovals[account][operator];
	}

	function safeTransferFrom(
		address from,
		address to,
		uint256 id,
		uint256 amount,
		bytes memory data
	) external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
		require(
			from == msg.sender || isApprovedForAll(from, msg.sender),
			"ERC1155: caller is not token owner nor approved"
		);
		require(to != address(0), "ERC1155: transfer to the zero address");

		address operator = msg.sender;

		uint256[] memory ids = new uint256[](1);
    ids[0] = id;
		uint256[] memory amounts = new uint256[](1);
    amounts[0] = amount;


		uint256 fromBalance = s.nftBalances[id][from];
		require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
		unchecked {
			s.nftBalances[id][from] = fromBalance - amount;
		}
		s.nftBalances[id][to] += amount;

		emit TransferSingle(operator, from, to, id, amount);

		_doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
	}

	function safeBatchTransferFrom(
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) external {
    AppStorage storage s = LibAppStorage.diamondStorage();
		require(
			from == msg.sender || isApprovedForAll(from, msg.sender),
			"ERC1155: caller is not token owner nor approved"
		);
		require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
		require(to != address(0), "ERC1155: transfer to the zero address");

		address operator = msg.sender;

		for (uint256 i = 0; i < ids.length; ++i) {
			uint256 id = ids[i];
			uint256 amount = amounts[i];

			uint256 fromBalance = s.nftBalances[id][from];
			require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
			unchecked {
				s.nftBalances[id][from] = fromBalance - amount;
			}
			s.nftBalances[id][to] += amount;
		}

		emit TransferBatch(operator, from, to, ids, amounts);


		_doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);	
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


	function createUser(uint256 caw, string memory username, uint8 strLength) external {
    AppStorage storage s = LibAppStorage.diamondStorage();
		// bytes(username).length does not always return chars in username
		// https://medium.com/hackernoon/working-with-strings-in-solidity-c4ff6d5f8008
		// pass str length

	}
}
