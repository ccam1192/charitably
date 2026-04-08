-- Single address field: merge legacy city into address, then drop city.

update public.neighbors
set address = nullif(
  trim(
    both
    from
      case
        when address is not null
        and btrim(address) <> ''
        and city is not null
        and btrim(city) <> ''
          then btrim(address) || ', ' || btrim(city)
        when address is not null
        and btrim(address) <> ''
          then btrim(address)
        when city is not null
        and btrim(city) <> ''
          then btrim(city)
        else coalesce(nullif(btrim(address), ''), nullif(btrim(city), ''))
      end
  ),
  ''
);

drop index if exists public.neighbors_city_idx;

alter table public.neighbors drop column if exists city;
