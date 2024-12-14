LOAD
    // Convert price to numeric
    Num(Replace(Replace(price, '$', ''), ',', '')) AS NumericPrice,

    // Calculate PricePerPerson directly from price
    Num(If(Replace(Replace(price, '$', ''), ',', '') > 0 AND accommodates > 0, 
        Num(Replace(Replace(price, '$', ''), ',', '')) / accommodates, 
        0)) AS PricePerPerson,

    host_is_superhost,
    amenities,
    property_type,
    room_type,
    accommodates,

    // Convert bathrooms to integer
    If(Len(Trim(bathrooms)) = 0, 0, Floor(bathrooms)) AS bathrooms, // Replace null or empty bathrooms with 0, then convert to integer

    bedrooms,
    beds,
    number_of_reviews,
    availability_365,

    // Calculate OccupancyRate directly
    Num(1 - (availability_365 / 365)) AS OccupancyRate, // Percentage of days booked

    // Replace nulls in reviews_per_month
    If(Len(Trim(reviews_per_month)) = 0, '-', reviews_per_month) AS reviews_per_month, // Replace null or empty with '-'

    // Fill review-related fields with '-' if null
    If(Len(Trim(review_scores_rating)) = 0, '-', review_scores_rating) AS review_scores_rating,
    If(Len(Trim(review_scores_cleanliness)) = 0, '-', review_scores_cleanliness) AS review_scores_cleanliness,
    If(Len(Trim(review_scores_communication)) = 0, '-', review_scores_communication) AS review_scores_communication,
    If(Len(Trim(review_scores_location)) = 0, '-', review_scores_location) AS review_scores_location,
    If(Len(Trim(review_scores_value)) = 0, '-', review_scores_value) AS review_scores_value,

    // Convert host_response_rate and host_acceptance_rate to numeric
    Num(Replace(host_response_rate, '%', '')) AS host_response_rate, // Remove % and convert to numeric
    Num(Replace(host_acceptance_rate, '%', '')) AS host_acceptance_rate, // Remove % and convert to numeric

    instant_bookable,

    // Count total amenities
    WildMatch(amenities, '*Wifi*') + WildMatch(amenities, '*Air Conditioning*') + 
    WildMatch(amenities, '*Kitchen*') + WildMatch(amenities, '*Heating*') AS TotalAmenities, 

    // Calculate ValueScore directly
    Num((review_scores_rating * 0.5) + 
        ((WildMatch(amenities, '*Wifi*') + WildMatch(amenities, '*Air Conditioning*') +
        WildMatch(amenities, '*Kitchen*') + WildMatch(amenities, '*Heating*')) * 0.3) + 
        (1 / Num(Replace(Replace(price, '$', ''), ',', '')) * 0.2)) AS ValueScore

FROM [lib://DataFiles/listings.csv]
(txt, utf8, embedded labels, delimiter is ',', msq)
WHERE Len(Trim(price)) > 0 // Exclude rows with missing price
	  AND (host_is_superhost = 't' OR host_is_superhost = 'f'); // Keep only rows where host_is_superhost is 't' or 'f'