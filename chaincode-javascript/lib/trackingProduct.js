/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

// Deterministic JSON.stringify()
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class ProductTracking extends Contract {
  async InitLedger(ctx) {
    const products = [
      {
        ProductID: "IX109025",
        Name: "Italian-Marble-Furniture",
        ManufacturerDetails: {
          id: "MN62581990",
          name: "TestCo1",
          type: "PremiumFurniture",
          origin: "Italy",
        },
        ProductClass: "High-Value-Goods",
        Owner: "MN62581990",
        OwnerType: "Manufacturer",
        Status: "PRODUCT_CREATED",
        ProductType: "Furniture",
        ManufacturingDate: ctx.stub.getDateTimestamp(),
        Price: "100000",
      },
      {
        ProductID: "JW561225",
        Name: "Diamond-Necklace",
        ManufacturerDetails: {
          id: "MN85643145",
          name: "JewelCo1",
          type: "Diamond Jewellery",
          origin: "South Africa",
        },
        ProductClass: "High-Value-Goods",
        Owner: "MN85643145",
        OwnerType: "Manufacturer",
        Status: "PRODUCT_CREATED",
        ProductType: "Jewellery",
        ManufacturingDate: ctx.stub.getDateTimestamp(),
        Price: "5000000",
      },
    ];

    for (const product of products) {
      product.docType = "product";
      // example of how to write to world state deterministically
      // use convetion of alphabetic order
      // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
      // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
      await ctx.stub.putState(
        product.ID,
        Buffer.from(stringify(sortKeysRecursive(product)))
      );
    }
  }

  // CreateProduct issues a new product to the world state with given details.
  async CreateProduct(
    ctx,
    id,
    product_class,
    product_name,
    manufacturer,
    owner,
    owner_type,
    product_type,
    value
  ) {
    const exists = await this.ProductExists(ctx, id);
    if (exists) {
      throw new Error(`The product with ${id} already exists`);
    }

    if (owner_type != "Manufacturer") {
      throw new Error(
        `The product can only be created by Manufacturer but current user is ${owner_type}`
      );
    }

    let manufacturer_details = JSON.parse(manufacturer);

    const product = {
      ProductID: id,
      Name: product_name,
      ManufacturerDetails: manufacturer_details,
      ProductClass: product_class,
      Owner: owner,
      OwnerType: owner_type,
      Status: "PRODUCT_CREATED",
      ProductType: product_type,
      ManufacturingDate: ctx.stub.getDateTimestamp(),
      Price: value,
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(product)))
    );
    return JSON.stringify(product);
  }

  // ReadProduct returns the product stored in the world state with given id.
  async ReadProduct(ctx, id) {
    const productJSON = await ctx.stub.getState(id); // get the product from chaincode state
    if (!productJSON || productJSON.length === 0) {
      throw new Error(`The product ${id} does not exist`);
    }
    return productJSON.toString();
  }

  // ProductExists returns true when product with given ID exists in world state.
  async ProductExists(ctx, id) {
    const productJSON = await ctx.stub.getState(id);
    return productJSON && productJSON.length > 0;
  }

  // ListProduct lists the created product
  async ListProduct(ctx, listingInfo, caller) {
    let listing_details = JSON.parse(listingInfo);

    const productString = await this.ReadProduct(ctx, id);
    const product = JSON.parse(productString);

    if (product.owner_type != "Manufacturer") {
      throw new Error(
        `The product can only be listed by Manufacturer but user is ${caller}`
      );
    }

    product.Status = "READY_FOR_SHIPMENT";
    product.ListingDate = ctx.stub.getDateTimestamp();
    product.ListingDetails = listing_details;
    product.OwnerType = "Dealer";

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(product)))
    );
  }

  // TransferProduct updates the owner field of product with given id in the world state.
  async TransferProduct(ctx, id, newOwner) {
    const productString = await this.ReadProduct(ctx, id);
    const product = JSON.parse(productString);
    const oldOwner = product.Owner;
    product.Owner = newOwner;
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(product)))
    );
    return oldOwner;
  }

  // GetAllProducts returns all products found in the world state.
  async GetAllProducts(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all products in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  // QueryProductsByOwner queries for products based on a passed in owner.
  // This is an example of a parameterized query where the query logic is baked into the chaincode,
  // and accepting a single query parameter (owner).
  // Only available on state databases that support rich query (e.g. CouchDB)
  // Example: Parameterized rich query
  async QueryProductsByOwner(ctx, owner, product_type) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = product_type;
    queryString.selector.owner = owner;
    return await this.GetQueryResultForQueryString(
      ctx,
      JSON.stringify(queryString)
    ); //shim.success(queryResults);
  }

  // QueryProducts uses a query string to perform a query for products.
  // Query string matching state database syntax is passed in and executed as is
  async QueryProducts(ctx, queryString) {
    return await this.GetQueryResultForQueryString(ctx, queryString);
  }

  // GetQueryResultForQueryString executes the passed in query string.
  // Result set is built and returned as a byte array containing the JSON results.
  async GetQueryResultForQueryString(ctx, queryString) {
    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let results = await this._GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  // TrackProductHistory returns the chain of custody for an product since issuance.
  async TrackProductHistory(ctx, productName) {
    let resultsIterator = await ctx.stub.getHistoryForKey(productName);
    let results = await this._GetAllResults(resultsIterator, true);

    return JSON.stringify(results);
  }

  // This is JavaScript so without Funcation Decorators, all functions are assumed
  // to be transaction functions
  //
  // For internal functions... prefix them with _
  async _GetAllResults(iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.txId;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }
}

module.exports = ProductTracking;
