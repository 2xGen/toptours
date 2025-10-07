<?php
/*
Plugin Name: Viator Live Search - Grid Layout Styling (ArubaBuddies Style)
Description: Viator API Free Text Search with Grid Layout Styling and Full Original Functionality
Version: 3.4
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

// Enqueue FontAwesome and Custom Styles
add_action('wp_enqueue_scripts', 'viator_enqueue_scripts');
function viator_enqueue_scripts() {
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
    wp_add_inline_style('font-awesome', '
        .tour-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
        }
        @media (min-width: 1200px) {
            .tour-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        .tour-card {
            display: flex;
            flex-direction: column;
            background: #fff;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            cursor: pointer;
        }
        .tour-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .tour-image-container {
            width: 100%;
            padding-top: 100%;
            position: relative;
            background-size: cover;
            background-position: center;
        }
        .tour-content {
            padding: 15px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        .tour-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 10px 0;
            line-height: 1.3;
            color: #333;
        }
        .tour-rating-container {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .tour-star {
            color: #FFD250;
            font-size: 20px;
            margin-right: 3px;
            line-height: 1;
        }
        .tour-rating {
            font-size: 16px;
            font-weight: 700;
            margin-right: 3px;
            color: #333;
        }
        .tour-reviews {
            font-size: 16px;
            color: #666;
        }
        .tour-price {
            font-size: 18px;
            font-weight: bold;
            color: #0dcdc2;
            margin-bottom: 15px;
        }
        .tour-button {
            display: block;
            background: #0dcdc2;
            color: white;
            padding: 5px 0;
            border-radius: 5px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            text-decoration: none;
            transition: background 0.2s ease;
            margin-top: auto;
        }
        .tour-button:hover {
            background: #0bb8ae;
        }
        .viator-see-all a {
            background-color: #0dcdc2;
            color: #fff;
            padding: 15px 30px;
            font-size: 18px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: 600;
        }
        .viator-see-all a:hover {
            background-color: #0bb5ad;
        }
        .pagination {
            text-align: center;
            margin-top: 30px;
        }
        .pagination a {
            background-color: #0dcdc2;
            color: #fff;
            padding: 10px 20px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
        }
        .pagination a:hover {
            background-color: #0bb5ad;
        }

        /* Mobile layout: horizontal tour card */
        @media (max-width: 480px) {
            .tour-grid {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .tour-card {
                flex-direction: row;
                align-items: stretch;
            }
            .tour-image-container {
                width: 40%;
                padding-top: 0%;
                flex-shrink: 0;
                background-size: cover;
                background-position: center;
            }
            .tour-content {
                width: 60%;
            }
            .tour-title {
                font-size: 14px;
            }
        }
    ');
}

// Search Form Shortcode
add_shortcode('viator_search_form', function() {
    // Get the URL for the results page (ensure '/tour-results/' is correct slug)
    $results_page_url = home_url('/tour-results/');

    ob_start();
    ?>
    <form action="<?php echo esc_url($results_page_url); ?>" method="GET" style="margin-bottom: 30px; display: flex; justify-content: center; width: 100%;">
        <label for="viatorSearchTermShortcode" class="screen-reader-text">Search for tours:</label> <input type="text" id="viatorSearchTermShortcode" name="searchTerm" placeholder="Search Top Tours" required style="padding: 8px; width: 75%; margin-right: 10px; border-radius: 10px; font-size: 18px; border: 1px solid #ccc;"> <button type="submit" style="padding: 8px 15px; background-color: #0dcdc2; /* <-- COLOR CHANGED HERE */ color: white; border: none; width: 25%; border-radius: 10px; font-size: 18px; cursor: pointer; transition: background-color 0.2s ease;"> <i class="fa fa-search"></i> </button>
    </form>
    <?php
    return ob_get_clean();
});

// Tour Results Shortcode
add_shortcode('viator_tour_results', function() {
    if (empty($_GET['searchTerm'])) return '<p>No search term provided.</p>';
    $search_term = sanitize_text_field($_GET['searchTerm']);
    $current_page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $output = '<div id="viator-tour-results-container">';
    $output .= viator_fetch_tours_paginated($search_term, $current_page);
    $output .= '</div>';
    return $output;
});

function viator_fetch_tours_paginated($search_term, $page = 1) {
    $api_key = defined('VIATOR_API_KEY') ? VIATOR_API_KEY : '';
    if (empty($api_key)) return '<p>API Key is missing.</p>';
    $per_page = 20;
    $start = ($page - 1) * $per_page + 1;
    $args = [
        'method'  => 'POST',
        'timeout' => 45,
        'headers' => [
            'Content-Type'     => 'application/json',
            'Accept'           => 'application/json;version=2.0',
            'Accept-Language'  => 'en-US',
            'exp-api-key'      => $api_key
        ],
        'body' => json_encode([
            "searchTerm" => $search_term,
            "searchTypes" => [[
                "searchType" => "PRODUCTS",
                "pagination" => [
                    "start" => $start,
                    "count" => $per_page
                ]
            ]],
            "currency" => "USD"
        ])
    ];

    $response = wp_remote_post('https://api.viator.com/partner/search/freetext', $args);
    if (is_wp_error($response)) {
        return '<p>Error: ' . esc_html($response->get_error_message()) . '</p>';
    }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    $products = $data['products']['results'] ?? [];
    $total_count = $data['products']['totalCount'] ?? 0;
    if (empty($products)) {
        return '<p>No tours found for "' . esc_html($search_term) . '".</p>';
    }
    $output = '<div class="tour-grid">';
    foreach ($products as $tour) {
        $output .= generate_tour_card_html($tour);
    }
    $output .= '</div>';
    $output .= generate_pagination_links($search_term, $page, $total_count, $per_page);
    $output .= viator_generate_see_all_button($search_term);
    return $output;
}

function generate_tour_card_html($tour) {
    $title = $tour['title'] ?? 'No title';
    $price = $tour['pricing']['summary']['fromPrice'] ?? 'N/A';
    $product_url = $tour['productUrl'] ?? '#';
    $image_url = $tour['images'][0]['variants'][3]['url'] ?? '';
    $reviews_total = $tour['reviews']['totalReviews'] ?? 0;
    $average_rating = number_format($tour['reviews']['combinedAverageRating'] ?? 0, 1);
    ob_start(); ?>
    <div class="tour-card">
        <div class="tour-image-container" style="background-image: url('<?php echo esc_url($image_url); ?>')"></div>
        <div class="tour-content">
            <span class="tour-title"><?php echo esc_html($title); ?></span>
            <div class="tour-rating-container">
                <span class="tour-star">★</span>
                <span class="tour-rating"><?php echo esc_html($average_rating); ?></span>
                <span class="tour-reviews">(<?php echo esc_html($reviews_total); ?>)</span>
            </div>
            <div class="tour-price">From $<?php echo esc_html($price); ?></div>
            <a href="<?php echo esc_url($product_url); ?>" target="_blank" class="tour-button" aria-label="View details for <?php echo esc_attr($title); ?>">
                View Details
            </a>
        </div>
    </div>
    <?php return ob_get_clean();
}

function generate_pagination_links($search_term, $current_page, $total_count, $per_page) {
    $total_pages = ceil($total_count / $per_page);
    if ($total_pages <= 1) return '';
    $html = '<div class="pagination">';
    if ($current_page > 1) {
        $prev_link = esc_url(add_query_arg([
            'searchTerm' => urlencode($search_term),
            'page' => $current_page - 1
        ], '/tour-results/'));
        $html .= '<a href="' . $prev_link . '">&laquo; Previous</a>';
    }
    $html .= '</div>';
    return $html;
}

function viator_generate_see_all_button($search_term) {
    $viator_link = 'https://www.viator.com/searchResults/all?text=' . urlencode($search_term) . '&pid=P00222666&mcid=42383&medium=link';
    $button_html = '<div class="viator-see-all" style="text-align: center; margin-top: 40px;">';
    $button_html .= '<a href="' . esc_url($viator_link) . '" target="_blank">';
    $button_html .= '🚀 Want to see all "' . esc_html($search_term) . '" tours? Click here!';
    $button_html .= '</a></div>';
    return $button_html;
}