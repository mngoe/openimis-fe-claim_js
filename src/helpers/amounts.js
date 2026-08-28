import { SERVICE_TYPE_PP_F, SERVICE_TYPE_PP_P, SERVICE_TYPE_PP_S } from "../constants";

export function claimedAmount(r) {
  let totalPrice = 0;
  if (Object?.keys(r)?.length != 0) {
    if ('item' in r) {
      return !!r.qtyProvided && !!r.priceAsked ? r.qtyProvided * parseFloat(r.priceAsked) : 0;
    } else {
      if (r?.service) {
        if (Object?.keys(r.service)?.length != 0) {
          let currentPackageType = r.service.packagetype;
          if (currentPackageType == SERVICE_TYPE_PP_S) {
            totalPrice += parseFloat(r.service.price);
          } else {
            // if this product has subItems we add everything
            if (r.service?.serviceserviceSet) {
              r.service.serviceserviceSet.forEach(subItem => {
                let qtyAsked = 0;
                if (currentPackageType == SERVICE_TYPE_PP_P) {
                  if (subItem.qtyAsked) {
                    qtyAsked = subItem.qtyAsked;
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                } else if (currentPackageType == SERVICE_TYPE_PP_F) {
                  if (subItem.qtyAsked) {
                    qtyAsked = subItem.qtyAsked;
                    if (subItem.qtyProvided < subItem.qtyAsked) {
                      qtyAsked = subItem.qtyProvided;
                    }
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                }
              });
            }
            if (r.service.serviceLinked) {
              r.service.serviceLinked.forEach(subItem => {
                let qtyAsked = 0;
                if (currentPackageType == SERVICE_TYPE_PP_P) {
                  if (subItem.qtyAsked) {
                    qtyAsked = subItem.qtyAsked;
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                } else if (currentPackageType == SERVICE_TYPE_PP_F) {
                  if (subItem.qtyAsked) {
                    qtyAsked = subItem.qtyAsked;
                    if (subItem.qtyProvided < subItem.qtyAsked) {
                      qtyAsked = subItem.qtyProvided;
                    }
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                }
              });
            }
            if (r?.services) {
              r.services.forEach(subItem => {
                let qtyAsked = 0;
                if (currentPackageType == SERVICE_TYPE_PP_P) {
                  if (subItem.qtyDisplayed) {
                    qtyAsked = subItem.qtyDisplayed;
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                } else if (currentPackageType == SERVICE_TYPE_PP_F) {
                  if (subItem.qtyDisplayed) {
                    qtyAsked = subItem.qtyDisplayed;
                    if (subItem.qtyProvided < subItem.qtyDisplayed) {
                      qtyAsked = subItem.qtyProvided;
                    }
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                }
              });
            }
            if (r?.items) {
              r.items.forEach(subItem => {
                let qtyAsked = 0;
                if (currentPackageType == SERVICE_TYPE_PP_P) {
                  if (subItem.qtyDisplayed) {
                    qtyAsked = subItem.qtyDisplayed;
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                } else if (currentPackageType == SERVICE_TYPE_PP_F) {
                  if (subItem.qtyDisplayed) {
                    qtyAsked = subItem.qtyDisplayed;
                    if (subItem.qtyProvided < subItem.qtyDisplayed) {
                      qtyAsked = subItem.qtyProvided;
                    }
                  }
                  totalPrice += qtyAsked * subItem.priceAsked;
                }
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
  if (r.status === 2) return 0;
  let totalPrice = 0;
  if ('item' in r) {
    let qty = r.qtyApproved !== null && r.qtyApproved !== "" ? r.qtyApproved : r.qtyProvided;
    let price = r.priceApproved !== null && r.priceApproved !== "" ? r.priceApproved : r.priceAsked;
    return qty * parseFloat(price);
  } else {
    if (r?.service) {
      let currentPackageType = r.service.packagetype;
      if (currentPackageType == SERVICE_TYPE_PP_S) {
        let price = r.priceApproved !== null && r.priceApproved !== "" ? r.priceApproved : r.priceAsked;
        totalPrice += parseFloat(price);
      } else {
        if (r?.services) {
          r.services.forEach(subItem => {
            let qtyApproved = 0;
            if (currentPackageType == SERVICE_TYPE_PP_P) {
              if (subItem.qtyAdjusted != null) {
                qtyApproved = subItem.qtyAdjusted;
              } else {
                qtyApproved = subItem.qtyDisplayed;
              }
              totalPrice += qtyApproved * subItem.priceAsked;
            } else if (currentPackageType == SERVICE_TYPE_PP_F) {
              if (subItem.qtyAdjusted != null) {
                qtyApproved = subItem.qtyAdjusted;
                if (subItem.qtyProvided < subItem.qtyAdjusted) {
                  qtyApproved = subItem.qtyProvided;
                }
              } else {
                qtyApproved = subItem.qtyDisplayed;
              }
              totalPrice += qtyApproved * subItem.priceAsked;
            }
          });
        }
        if (r?.items) {
          r.items.forEach(subItem => {
            let qtyApproved = 0;
            if (currentPackageType == SERVICE_TYPE_PP_P) {
              if (subItem.qtyAdjusted != null) {
                qtyApproved = subItem.qtyAdjusted;
              } else {
                qtyApproved = subItem.qtyDisplayed;
              }
              totalPrice += qtyApproved * subItem.priceAsked;
            } else if (currentPackageType == SERVICE_TYPE_PP_F) {
              if (subItem.qtyAdjusted != null) {
                qtyApproved = subItem.qtyAdjusted;
                if (subItem.qtyProvided < subItem.qtyAdjusted) {
                  qtyApproved = subItem.qtyProvided;
                }
              } else {
                qtyApproved = subItem.qtyDisplayed;
              }
              totalPrice += qtyApproved * subItem.priceAsked;
            }
          });
        }
      }
      r.priceApproved = totalPrice;
      return totalPrice;
    }
  }
  return totalPrice;
}
export function auditedAmount(r) {
  if (r.status === 2) return 0;
  let totalPrice = 0;
  if ('item' in r) {
    let qty = r.qtyAudited ?? r.qtyAdjusted ?? r.qtyProvided ?? 0;
    let price = r.priceApproved ?? r.priceAsked ?? 0;
    return parseInt(qty) * parseFloat(price);
  } else {
    if (r?.service) {
      let currentPackageType = r.service.packagetype;
      if (currentPackageType == SERVICE_TYPE_PP_S) {
        let price = r.priceApproved ?? r.priceAsked ?? 0;
        totalPrice += parseFloat(price);
      } else {
        const getAuditedQty = (subItem) => parseInt(subItem.qtyAudited ?? subItem.qtyAdjusted ?? subItem.qtyDisplayed ?? 0);
        if (r?.services) {
          r.services.forEach(subItem => {
            const qty = getAuditedQty(subItem);
            if (currentPackageType == SERVICE_TYPE_PP_F && subItem.qtyProvided < qty) {
              totalPrice += parseInt(subItem.qtyProvided) * parseFloat(subItem.priceAsked);
            } else {
              totalPrice += qty * parseFloat(subItem.priceAsked);
            }
          });
        }
        if (r?.items) {
          r.items.forEach(subItem => {
            const qty = getAuditedQty(subItem);
            if (currentPackageType == SERVICE_TYPE_PP_F && subItem.qtyProvided < qty) {
              totalPrice += parseInt(subItem.qtyProvided) * parseFloat(subItem.priceAsked);
            } else {
              totalPrice += qty * parseFloat(subItem.priceAsked);
            }
          });
        }
      }
      r.priceAudited = totalPrice;
      return totalPrice;
    }
  }
  return totalPrice;
}
