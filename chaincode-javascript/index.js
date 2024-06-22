/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const trackingProduct = require("./lib/trackingProduct");

module.exports.TrackingProduct = trackingProduct;
module.exports.contracts = [trackingProduct];
