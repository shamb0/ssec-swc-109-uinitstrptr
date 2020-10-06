// SPDX-License-Identifier: MIT
pragma solidity ^0.4.18;
// pragma solidity ^0.5.1;
// pragma solidity ^0.6.0;

// import "@nomiclabs/buidler/console.sol";

// A Locked Name Registrar
contract NameRegistrar {

    bool public unlocked = false;  // registrar locked, no name updates

    struct NameRecord { // map hashes to addresses
        bytes32 name;
        address mappedAddress;
    }

    mapping(address => NameRecord) public registeredNameRecord; // records who registered names
    mapping(bytes32 => address) public resolve; // resolves hashes to addresses

    function register(bytes32 _name, address _mappedAddress) public {

        // set up the new NameRecord
        // NameRecord memory newRecord;
        NameRecord storage newRecord;
        newRecord.name = _name;
        newRecord.mappedAddress = _mappedAddress;

        resolve[_name] = _mappedAddress;
        registeredNameRecord[msg.sender] = newRecord;

        require(unlocked); // only allow registrations if contract is unlocked
    }

}