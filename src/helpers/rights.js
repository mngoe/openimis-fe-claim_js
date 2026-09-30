import { decodeId, getGrantedRights, getUserBusinessAccessReferences, selectCurrentUser } from "@openimis/fe-core";

import { UBA_LINK_TYPE_CLAIM_ADMIN } from "../constants";

/**
 * Claim rights and the health facility they are granted on.
 *
 * A claim administrator is a user holding the CLAIM_ADMIN credential on a health
 * facility (a UserBusinessAccess link), not a user holding the standard claim admin
 * role. Their rights therefore sit in the *UBA bag*, granted only where such a link
 * exists, and never in the global bag a page reads from
 * `state.core.user.i_user.rights`: a page gating on that bag alone locks them out of
 * everything, which is what used to happen on the claim edit page.
 *
 * See `docs/rights.md` in the core module for the two bags.
 */

/**
 * The business map of the health facilities a claim right may be granted on: the one at
 * hand, or the ones the user is claim admin of when the caller has none (a direct hit on
 * the claim edit route, before a facility has been picked).
 *
 * The credential is the whole demand: which business object types it may be used on is
 * the backend registry's to say, so no model is named here.
 */
export const claimAdminAccessRequirements = (user, healthFacility) => {
  if (healthFacility?.uuid || healthFacility?.id) {
    // a link stores the uuid or the primary key of the facility, the picker hands the
    // uuid and the (relay encoded) id: offer both
    return [healthFacility.uuid, healthFacility.id && decodeId(healthFacility.id)]
      .filter(Boolean)
      .map((objectId) => ({ objectId, linkTypes: UBA_LINK_TYPE_CLAIM_ADMIN }));
  }
  // a stored link carries the type of the object it points at: nothing to look up
  return getUserBusinessAccessReferences(user, UBA_LINK_TYPE_CLAIM_ADMIN).map(({ model, objectId }) => [
    model,
    objectId,
    UBA_LINK_TYPE_CLAIM_ADMIN,
  ]);
};

/**
 * The rights the user may exercise on `healthFacility`: their global bag, plus their UBA
 * bag when a CLAIM_ADMIN link covers that facility. Holding the link grants nothing by
 * itself - the rights are still the roles' to give, the UBA flagged ones only applying
 * where the user is linked.
 */
export const claimRightsOn = (user, healthFacility) =>
  getGrantedRights({ user, accessRequirements: claimAdminAccessRequirements(user, healthFacility) });

/**
 * The rights of the current user on the health facility the claim screens work under -
 * the one picked on the health facilities page, or the one of the claim being edited.
 * A drop-in replacement for the `state.core.user.i_user.rights` mapStateToProps
 * boilerplate on those screens.
 */
export const selectClaimRights = (state) =>
  claimRightsOn(selectCurrentUser(state), state?.claim?.claimHealthFacility ?? null);
