-- The placeholder email domain moved off `.invalid` (a reserved,
-- non-deliverable TLD per RFC 2606) because Korapay's email format
-- validator rejects it, which would break deposits for every phone-login
-- user. See src/lib/phone.ts. Migrate any accounts already on the old
-- domain; account.accountId is the user id (not the email), so this is
-- safe and does not affect login.

update "user"
set email = replace(email, '@phone.nivvy.invalid', '@phone.nivvyusers.com')
where email like '%@phone.nivvy.invalid';
