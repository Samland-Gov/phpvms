<?php

namespace App\Support;

use League\ISO3166\ISO3166;

/**
 * Class Countries
 */
class Countries
{
    /**
     * Get a select box list of all the countries
     *
     * @return \Illuminate\Support\Collection
     */
    public static function getSelectList()
    {
        $countries = collect((new ISO3166())->all())
            ->mapWithKeys(static function ($item, $key) {
                return [strtolower($item['alpha2']) => $item['name']];
            });

        return $countries->merge([
            'zl_' => 'Samland',
        ]);
    }
}
