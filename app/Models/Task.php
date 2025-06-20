<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = ['content', 'column_id'];

    public function column(): BelongsTo
    {
        return $this->belongsTo(Column::class);
    }
}