export function claimedAmount(r) {
  let totalPrice = 0;
  if (Object?.keys(r)?.length != 0) {
    if ('item' in r) {
      return !!r.qtyProvided && !!r.priceAsked ? r.qtyProvided * parseFloat(r.priceAsked) : 0;
    } else {
      if (r?.service) {
        if (Object?.keys(r.service)?.length != 0) {
          let currentPackageType = r.service.packagetype;
          if (currentPackageType == "S") {
            totalPrice += parseFloat(r.service.price);
          } else {
            // if this product has subItems we add everything
            if (r.service?.serviceserviceSet) {
              r.service.serviceserviceSet.forEach(subItem => {
                let qtyAsked = 0;
                if (subItem.qtyAsked) {
                  qtyAsked = subItem.qtyAsked;
                }
                totalPrice += qtyAsked * subItem.priceAsked;
                // if(currentPackageType=="P"){
                //   if(subItem.qtyAsked){
                //     qtyAsked = subItem.qtyAsked;
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }else if (currentPackageType=="F"){
                //   if(subItem.qtyAsked){
                //     qtyAsked = subItem.qtyAsked;
                //     if(subItem.qtyProvided<subItem.qtyAsked){
                //       qtyAsked = subItem.qtyProvided;
                //     }
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }
              });
            }
            if (r.service.servicesLinked) {
              r.service.servicesLinked.forEach(subItem => {
                let qtyAsked = 0;
                if (subItem.qtyAsked) {
                  qtyAsked = subItem.qtyAsked;
                }
                totalPrice += qtyAsked * subItem.priceAsked;
                // if(currentPackageType=="P"){
                //   if(subItem.qtyAsked){
                //     qtyAsked = subItem.qtyAsked;
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }else if (currentPackageType=="F"){
                //   if(subItem.qtyAsked){
                //     qtyAsked = subItem.qtyAsked;
                //     if(subItem.qtyProvided<subItem.qtyAsked){
                //       qtyAsked = subItem.qtyProvided;
                //     }
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }
              });
            }
            if (r?.claimlinkedService) {
              r.claimlinkedService.forEach(subItem => {
                let qtyAsked = 0;
                if (subItem.qtyDisplayed) {
                  qtyAsked = subItem.qtyDisplayed;
                }
                totalPrice += qtyAsked * subItem.priceAsked;
                // if(currentPackageType=="P"){
                //   if(subItem.qtyDisplayed){
                //     qtyAsked = subItem.qtyDisplayed;
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }else if (currentPackageType=="F"){
                //   if(subItem.qtyDisplayed){
                //     qtyAsked = subItem.qtyDisplayed;
                //     if(subItem.qtyProvided<subItem.qtyDisplayed){
                //       qtyAsked = subItem.qtyProvided;
                //     }
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }
              });
            }
            if (r?.claimlinkedItem) {
              r.claimlinkedItem.forEach(subItem => {
                let qtyAsked = 0;
                if (subItem.qtyDisplayed) {
                  qtyAsked = subItem.qtyDisplayed;
                }
                totalPrice += qtyAsked * subItem.priceAsked;
                // if (currentPackageType == "P") {
                //   if (subItem.qtyDisplayed) {
                //     qtyAsked = subItem.qtyDisplayed;
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // } else if (currentPackageType == "F") {
                //   if (subItem.qtyDisplayed) {
                //     qtyAsked = subItem.qtyDisplayed;
                //     if (subItem.qtyProvided < subItem.qtyDisplayed) {
                //       qtyAsked = subItem.qtyProvided;
                //     }
                //   }
                //   totalPrice += qtyAsked * subItem.priceAsked;
                // }
              });
            }

          }
          r.service.priceAsked = totalPrice;
          r.service.price = totalPrice;
          return totalPrice;
        }
      }
    }
  }
  return totalPrice;
  //
}
export function approvedAmount(r) {
  let totalApprouved = 0;
  if (r.status === 2) return 0;
  if (r?.service) {
    if (Object?.keys(r.service)?.length != 0) {
      let currentPackageType = r.service.packagetype;
      if (currentPackageType == "S") {
        let qty = r.qtyApproved !== null && r.qtyApproved !== "" ? r.qtyApproved : r.qtyProvided;
        let price = r.priceApproved !== null && r.priceApproved !== "" ? r.priceApproved : r.priceAsked;
        totalApprouved += qty * parseFloat(price);
      } else {
        if (r.service?.serviceserviceSet) {
          r.service.serviceserviceSet.forEach(subItem => {
            let qtyAdjusted = 0;
            if (subItem.qtyAdjusted) {
              qtyAdjusted = subItem.qtyAdjusted;
            }
            totalApprouved += qtyAdjusted * subItem.priceAsked;
          });
        }
        if (r.service.servicesLinked) {
          r.service.servicesLinked.forEach(subItem => {
            let qtyAdjusted = 0;
            if (subItem.qtyAdjusted) {
              qtyAdjusted = subItem.qtyAdjusted;
            }
            totalApprouved += qtyAdjusted * subItem.priceAsked;
          });
        }
        if (r?.claimlinkedService) {
          r.claimlinkedService.forEach(subItem => {
            let qtyAdjusted = 0;
            if (subItem.qtyAdjusted) {
              qtyAdjusted = subItem.qtyAdjusted;
            }
            totalApprouved += qtyAdjusted * subItem.priceAsked;
          });
        }
        if (r?.claimlinkedItem) {
          r.claimlinkedItem.forEach(subItem => {
            let qtyAdjusted = 0;
            if (subItem.qtyAdjusted) {
              qtyAdjusted = subItem.qtyAdjusted;
            }
            totalApprouved += qtyAdjusted * subItem.priceAsked;
          });
        }
      }
      r.service.priceApprouved = totalApprouved;
      return totalApprouved;
    }
  }
  return totalApprouved;
}
